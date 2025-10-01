/**
 * 地圖選點功能
 * 處理地圖互動和位置選擇
 */

import { ref } from "vue";
import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 初始化地圖選點狀態
 */
export function initLocationState() {
  const showMapPicker = ref(false);
  return { showMapPicker };
}

/**
 * 開啟地圖選點
 */
export function openMapPicker(showMapPicker: Ref<boolean>) {
  showMapPicker.value = true;
}

/**
 * 處理地圖選點結果
 * @param formData 表單資料 ref
 * @param location 選取的位置資訊
 */
export function handleLocationSelect(
  formData: Ref<DemandFormData>,
  location: { lat: number; lng: number; address: string }
) {
  formData.value.location = {
    lat: location.lat,
    lng: location.lng,
    address: location.address,
  };
}
