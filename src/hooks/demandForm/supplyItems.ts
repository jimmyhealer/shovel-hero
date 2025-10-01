/**
 * 物資清單項目管理
 * 提供新增和刪除物資項目的功能
 */

import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 新增物資項目
 * @param formData 表單資料 ref
 */
export function addSupplyItem(formData: Ref<DemandFormData>) {
  formData.value.supplyItems.push({ itemName: "", quantity: "", unit: "" });
}

/**
 * 移除物資項目
 * 至少保留一個項目
 * @param formData 表單資料 ref
 * @param index 要移除的項目索引
 */
export function removeSupplyItem(formData: Ref<DemandFormData>, index: number) {
  if (formData.value.supplyItems.length > 1) {
    formData.value.supplyItems.splice(index, 1);
  }
}
