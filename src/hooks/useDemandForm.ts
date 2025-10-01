/**
 * 需求表單 Hook - 門面模式
 * 整合所有子模組，維持原有 API 介面
 * 對齊 SRS（plan.md section 10, 12）
 */

import { useToastStore } from "@/stores/toast";

// 引入所有子模組
import { initState, reset } from "./demandForm/state";
import { typeOptions, regionOptions } from "./demandForm/options";
import { isSiteType, isHumanType, isSupplyType } from "./demandForm/derived";
import { bindTypeEffects } from "./demandForm/effects";
import { addSupplyItem, removeSupplyItem } from "./demandForm/supplyItems";
import { initLocationState, openMapPicker, handleLocationSelect } from "./demandForm/location";
import { validateForm } from "./demandForm/validation";
import { handleSubmit } from "./demandForm/submit";

// 重新導出表單介面（維持向後相容）
export type { DemandFormData } from "@/types/forms";

export function useDemandForm(initialData?: Partial<import("@/types/forms").DemandFormData>) {
  const toastStore = useToastStore();

  // 初始化狀態
  const { formData, isSubmitting, errors } = initState(initialData);
  const { showMapPicker } = initLocationState();

  // 綁定類型切換效果
  bindTypeEffects(formData);

  // 處理地圖選點結果（添加 toast 提示）
  function handleLocationSelectWithToast(location: { lat: number; lng: number; address: string }) {
    handleLocationSelect(formData, location);
    toastStore.success("已選擇地點");
  }

  return {
    // 狀態
    formData,
    isSubmitting,
    errors,
    showMapPicker,

    // 計算屬性
    isSiteType: isSiteType(formData),
    isHumanType: isHumanType(formData),
    isSupplyType: isSupplyType(formData),

    // 選項
    typeOptions,
    regionOptions,

    // 方法
    addSupplyItem: () => addSupplyItem(formData),
    removeSupplyItem: (index: number) => removeSupplyItem(formData, index),
    validateForm: () => validateForm(formData, errors),
    handleSubmit: () => handleSubmit(formData, isSubmitting, errors),
    resetForm: () => reset(formData, errors),
    openMapPicker: () => openMapPicker(showMapPicker),
    handleLocationSelect: handleLocationSelectWithToast,
  };
}
