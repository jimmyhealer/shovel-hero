/**
 * 計算屬性和類型判斷
 * 提供表單類型相關的計算邏輯
 */

import { computed } from "vue";
import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 檢查是否為場站類型（site-*）
 */
export function isSiteType(formData: Ref<DemandFormData>) {
  return computed(() => formData.value.type.startsWith("site-"));
}

/**
 * 檢查是否為人力需求類型
 */
export function isHumanType(formData: Ref<DemandFormData>) {
  return computed(() => formData.value.type === "human");
}

/**
 * 檢查是否為物資需求類型
 */
export function isSupplyType(formData: Ref<DemandFormData>) {
  return computed(() => formData.value.type === "supply");
}
