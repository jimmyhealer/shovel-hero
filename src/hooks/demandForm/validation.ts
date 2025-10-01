/**
 * 表單驗證規則
 * 對齊 SRS：欄位驗證與格式限制（plan.md section 11）
 */

import { isValidPhone, isValidEmail, isPositiveNumber } from "@/lib/validators";
import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 驗證表單資料
 * @param formData 表單資料 ref
 * @param errors 錯誤訊息 ref
 * @returns 是否驗證通過
 */
export function validateForm(
  formData: Ref<DemandFormData>,
  errors: Ref<Record<string, string>>
): boolean {
  errors.value = {};

  const data = formData.value;

  // 基本欄位驗證
  if (!data.type) {
    errors.value.type = "請選擇類型";
  }

  if (!data.region.trim()) {
    errors.value.region = "請輸入所屬災區/區域";
  }

  if (!data.location.address.trim()) {
    errors.value.address = "請輸入地點";
  }

  if (!data.contact.name.trim()) {
    errors.value.contactName = "請輸入聯絡人姓名";
  }

  if (!data.contact.phone.trim()) {
    errors.value.contactPhone = "請輸入聯絡電話";
  } else if (!isValidPhone(data.contact.phone)) {
    errors.value.contactPhone = "請輸入有效的電話號碼";
  }

  if (data.contact.email && !isValidEmail(data.contact.email)) {
    errors.value.contactEmail = "請輸入有效的 Email";
  }

  // 人力需求專屬驗證
  if (data.type === "human") {
    if (!data.humanNeed.required || !isPositiveNumber(data.humanNeed.required)) {
      errors.value.humanRequired = "請輸入所需人數";
    }
  }

  // 物資需求專屬驗證
  if (data.type === "supply") {
    data.supplyItems.forEach((item, index) => {
      if (!item.itemName.trim()) {
        errors.value[`supplyItem${index}Name`] = "請輸入物資名稱";
      }
      if (!item.quantity || !isPositiveNumber(item.quantity)) {
        errors.value[`supplyItem${index}Quantity`] = "請輸入數量";
      }
      if (!item.unit.trim()) {
        errors.value[`supplyItem${index}Unit`] = "請輸入單位";
      }
    });
  }

  return Object.keys(errors.value).length === 0;
}
