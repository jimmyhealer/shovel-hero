<script setup>
import { ref } from "vue";
import { useMapStore } from "../../stores/map";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  Package,
  Construction,
  ParkingCircle,
  Home,
  Utensils,
  PlusIcon,
} from "lucide-vue-next";
import DemandForm from "@/components/Forms/DemandForm.vue";
import { useToastStore } from "@/stores/toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const mapStore = useMapStore();
const toastStore = useToastStore();

const localFilters = ref({
  type: null,
  status: "approved",
  region: null,
});

const filterTypes = [
  { value: null, label: "全部類型", icon: Globe },
  { value: "human", label: "人力任務", icon: Users },
  { value: "supply", label: "物資需求", icon: Package },
  { value: "site-holding", label: "污泥暫置場", icon: Construction },
  { value: "site-parking", label: "物資停放處", icon: ParkingCircle },
  { value: "site-stay", label: "住宿地點", icon: Home },
  { value: "site-food", label: "領吃食區域", icon: Utensils },
];

const showDemandForm = ref(false);

function selectType(type) {
  localFilters.value.type = type;
  mapStore.updateFilters(localFilters.value);
}

// 對齊 SRS：處理需求提交（plan.md 12）
async function handleDemandSubmit(data) {
  try {
    // 寫入 Firestore demands 集合
    const docRef = await addDoc(collection(db, "demands"), data);

    // 更新本地狀態
    mapStore.addDemand({
      id: docRef.id,
      ...data,
    });

    toastStore.success("需求提交成功！管理員將在 30 分鐘內審核您的需求。");
    showDemandForm.value = false;
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
  }
}
</script>

<template>
  <div class="rounded-lg max-w-[120px]">
    <!-- 新增需求按鈕 -->
    <div class="mb-3">
      <Button
        @click="showDemandForm = true"
        variant="default"
        class="w-full justify-start gap-3 text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <PlusIcon :size="20" class="flex-shrink-0" />
        <span class="flex-1 text-left font-semibold">新增需求</span>
      </Button>
    </div>

    <!-- Type Filter Buttons -->
    <div class="space-y-1">
      <Button
        v-for="type in filterTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :variant="localFilters.type === type.value ? 'default' : 'secondary'"
        :class="[
          'w-full justify-start gap-3 text-white backdrop-blur-sm',
          localFilters.type === type.value
            ? 'bg-gray-600/80 shadow-lg hover:bg-gray-600/90'
            : 'bg-gray-600/60 hover:bg-gray-600/70',
        ]"
      >
        <component :is="type.icon" :size="20" class="flex-shrink-0" />
        <span class="flex-1 text-left">{{ type.label }}</span>
      </Button>
    </div>
  </div>

  <!-- Demand Form Modal -->
  <DemandForm v-model:open="showDemandForm" @submit="handleDemandSubmit" />
</template>
