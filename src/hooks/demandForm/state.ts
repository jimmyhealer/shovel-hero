/**
 * 表單狀態管理和初始化
 * 負責表單資料的初始化、重置和狀態管理
 */

import { ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 建立預設的表單資料
 */
function createDefaultFormData(): DemandFormData {
  return {
    type: "human",
    title: "",
    description: "",
    region: "花蓮縣",
    location: {
      lat: null,
      lng: null,
      address: "",
    },
    contact: {
      name: "",
      phone: "",
      email: "",
    },
    humanNeed: {
      required: "",
      riskNotes: "",
    },
    supplyItems: [{ itemName: "", quantity: "", unit: "" }],
  };
}

/**
 * 初始化表單狀態
 * @param initialData 初始資料（用於編輯模式）
 * @returns 表單狀態物件
 */
export function initState(initialData?: Partial<DemandFormData>) {
  const formData = ref<DemandFormData>(createDefaultFormData());
  const isSubmitting = ref(false);
  const errors = ref<Record<string, string>>({});

  // 如果有初始資料，合併到表單
  if (initialData) {
    formData.value = { ...formData.value, ...initialData };
  }

  return {
    formData,
    isSubmitting,
    errors,
  };
}

/**
 * 重置表單狀態
 * @param formData 表單資料 ref
 * @param errors 錯誤訊息 ref
 */
export function reset(formData: ReturnType<typeof ref<DemandFormData>>, errors: ReturnType<typeof ref<Record<string, string>>>) {
  formData.value = createDefaultFormData();
  errors.value = {};
}
