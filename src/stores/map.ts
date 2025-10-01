import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";
import { subscribeToPublishedDemands } from "@/services";
import type { Demand, DemandType } from "@/types/firestore";

export const useMapStore = defineStore("map", () => {
  // State
  const selectedDemand = ref<Demand | null>(null);
  const isPanelOpen = ref(false);
  const demands = ref<Demand[]>([]);
  const filters = ref({
    type: null as DemandType | null,
    status: "approved",
    region: null as string | null,
  });
  const isLoading = ref(false);
  const unsubscribe = ref<(() => void) | null>(null);

  // Computed
  const filteredDemands = computed(() => {
    return demands.value.filter((demand) => {
      if (filters.value.status && demand.status !== filters.value.status) {
        return false;
      }
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
      demands.value[index] = { ...demands.value[index], ...updates };
    }
  }

  // 對齊 SRS：即時監聽 Firestore 資料（只取 publishTime <= now 的需求）
  function startRealtimeSync() {
    if (unsubscribe.value) {
      return; // 已經在監聽中
    }

    isLoading.value = true;

    unsubscribe.value = subscribeToPublishedDemands(
      (newDemands) => {
        demands.value = newDemands;
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
  };
});
