/**
 * 表單資料到 Firestore DTO 映射
 * 將表單輸入資料轉換為 Firestore 儲存格式
 */

import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";
import type { Demand } from "@/types/firestore";

/**
 * 將表單資料映射為 Firestore Demand 物件
 * 對齊 SRS：demands 資料結構（plan.md section 10）
 * @param formData 表單資料 ref
 * @returns Firestore Demand 物件
 */
export function toDemandPayload(formData: Ref<DemandFormData>): Partial<Demand> {
  const data = formData.value;

  // 基本欄位
  const basePayload = {
    type: data.type,
    title: data.title?.trim() || "",
    description: data.description?.trim() || "",
    region: data.region.trim(),
    location: {
      lat: data.location.lat || 0,
      lng: data.location.lng || 0,
      address: data.location.address.trim(),
    },
    contact: {
      name: data.contact.name.trim(),
      phone: data.contact.phone.trim(),
      email: data.contact.email?.trim() || "",
    },
  };

  // 根據類型添加專屬欄位
  if (data.type === "human") {
    return {
      ...basePayload,
      humanNeed: {
        required: Number(data.humanNeed.required),
        riskNotes: data.humanNeed.riskNotes?.trim() || "",
      },
    };
  }

  if (data.type === "supply") {
    return {
      ...basePayload,
      supplyItems: data.supplyItems.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
      })),
    };
  }

  // site-* 類型只需基本欄位
  return basePayload;
}
