import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";
import {
  subscribeToPublishedDemands,
  countApprovedApplications,
  subscribeVolunteerApplicationCount,
  subscribeDonationCount,
  subscribeDonationsByDemand,
} from "@/services";
import type { Demand, DemandType } from "@/types/firestore";

export const useMapStore = defineStore("map", () => {
  // State
  const selectedDemand = ref<Demand | null>(null);
  const isPanelOpen = ref(false);
  const demands = ref<Demand[]>([]);
  const filters = ref({
    type: null as DemandType | null,
    region: null as string | null,
  });
  const isLoading = ref(false);
  const unsubscribe = ref<(() => void) | null>(null);
  const countsUnsubscribers = ref<Record<string, () => void>>({});
  const donationsUnsubscribers = ref<Record<string, () => void>>({});

  // Computed
  const filteredDemands = computed(() => {
    return demands.value.filter((demand) => {
      if (filters.value.type && demand.type !== filters.value.type) {
        return false;
      }
      if (filters.value.region && demand.region !== filters.value.region) {
        return false;
      }
      return true;
    });
  });

  // Actions
  function selectDemand(demand) {
    selectedDemand.value = demand;
    isPanelOpen.value = true;
  }

  function closePanel() {
    isPanelOpen.value = false;
    selectedDemand.value = null;
  }

  function setDemands(newDemands) {
    demands.value = newDemands;
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
  }

  // 對齊 SRS：新增需求到 Firestore（plan.md 12）
  function addDemand(demand) {
    demands.value.push(demand);
  }

  // 對齊 SRS：更新現有需求
  function updateDemand(demandId: string, updates: Partial<Demand>) {
    const index = demands.value.findIndex((d) => d.id === demandId);
    if (index !== -1) {
      demands.value[index] = { ...demands.value[index], ...updates } as Demand;
    }
  }

  // 對齊 SRS：即時監聽 Firestore 資料（只取 publishTime <= now 的需求）
  function startRealtimeSync() {
    if (unsubscribe.value) {
      return; // 已經在監聽中
    }

    isLoading.value = true;

    unsubscribe.value = subscribeToPublishedDemands(
      async (newDemands) => {
        demands.value = newDemands;
        // 異步刷新人力需求的 appliedCount，不阻塞 UI 繪製
        refreshAppliedCounts();
        // 建立/更新各需求的即時監聽（志工/捐贈）
        setupCountsSubscriptions();
        isLoading.value = false;
      },
      {
        type: filters.value.type || undefined,
        region: filters.value.region || undefined,
      },
    );
  }

  // 停止即時監聽
  function stopRealtimeSync() {
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
    // 取消所有單筆需求的 counts 監聽
    Object.values(countsUnsubscribers.value).forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    countsUnsubscribers.value = {};
    // 取消所有捐贈列表監聽
    Object.values(donationsUnsubscribers.value).forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    donationsUnsubscribers.value = {};
  }

  // 計算並更新人力需求的已報名人數（appliedCount）
  async function refreshAppliedCounts() {
    const humanDemands = demands.value.filter((d) => d.type === "human");
    if (humanDemands.length === 0) return;

    // 併發查詢每個需求的已審核報名數（publishTime <= now）
    const countPromises = humanDemands.map(async (demand) => {
      try {
        const count = await countApprovedApplications(demand.id);
        return { demandId: demand.id, count } as { demandId: string; count: number };
      } catch {
        return { demandId: demand.id, count: 0 } as { demandId: string; count: number };
      }
    });

    const results = await Promise.all(countPromises);
    results.forEach(({ demandId, count }) => {
      updateDemand(demandId, { appliedCount: count });
    });
  }

  // 為每個需求建立即時監聽（志工報名數、捐贈數）
  function setupCountsSubscriptions() {
    const nextUnsubs: Record<string, () => void> = {};
    const nextDonationListUnsubs: Record<string, () => void> = {};

    demands.value.forEach((demand) => {
      const unsubs: Array<() => void> = [];

      if (demand.type === "human") {
        unsubs.push(
          subscribeVolunteerApplicationCount(demand.id, (count) => {
            updateDemand(demand.id, { appliedCount: count });
          }),
        );
      }

      if (demand.type === "supply") {
        unsubs.push(
          subscribeDonationCount(demand.id, (count) => {
            updateDemand(demand.id, { donationCount: count } as any);
          }),
        );

        // 監聽整個捐贈列表以便即時計算剩餘數量
        nextDonationListUnsubs[demand.id] = subscribeDonationsByDemand(
          demand.id,
          (donations) => {
            const originalItems = (demands.value.find((d) => d.id === demand.id) as any)?.supplyItems || [];
            const remaining = computeRemainingSupplyItems(originalItems, donations);
            updateDemand(demand.id, { remainingSupplyItems: remaining } as any);
          },
        );
      }

      // 合併成一個清理函式
      nextUnsubs[demand.id] = () => unsubs.forEach((fn) => fn());
    });

    // 先清掉舊的
    Object.values(countsUnsubscribers.value).forEach((fn) => {
      try {
        fn();
      } catch {}
    });

    countsUnsubscribers.value = nextUnsubs;
    // 更新捐贈列表監聽
    Object.values(donationsUnsubscribers.value).forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    donationsUnsubscribers.value = nextDonationListUnsubs;
  }

  // 將捐贈列表彙總到剩餘供應清單
  function computeRemainingSupplyItems(
    supplyItems: Array<{ itemName: string; quantity: number; unit: string }>,
    donations: Array<{ itemName: string; quantity: number; unit: string }>,
  ) {
    // 彙總已捐贈數量（以 itemName + unit 做 key）
    const donatedMap = new Map<string, number>();
    donations.forEach((d: any) => {
      const key = `${d.itemName}__${d.unit}`;
      const prev = donatedMap.get(key) || 0;
      donatedMap.set(key, prev + Number(d.quantity || 0));
    });

    // 計算剩餘 = 需求 - 已捐贈，最小為 0
    const remaining = supplyItems
      .map((it: any) => {
        const key = `${it.itemName}__${it.unit}`;
        const donated = donatedMap.get(key) || 0;
        const left = Math.max(0, Number(it.quantity || 0) - donated);
        return { itemName: it.itemName, quantity: left, unit: it.unit };
      })
      .filter((it) => it.quantity > 0);

    return remaining;
  }

  return {
    selectedDemand,
    isPanelOpen,
    demands,
    filters,
    filteredDemands,
    isLoading,
    selectDemand,
    closePanel,
    setDemands,
    updateFilters,
    addDemand,
    updateDemand,
    startRealtimeSync,
    stopRealtimeSync,
    refreshAppliedCounts,
    setupCountsSubscriptions,
    computeRemainingSupplyItems,
  };
});
