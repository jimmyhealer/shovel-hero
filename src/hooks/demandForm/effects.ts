/**
 * 類型切換時的副作用處理
 * 當表單類型變更時，自動清空不相關的欄位
 */

import { watch } from "vue";
import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 綁定類型切換的副作用
 * 當類型變更時，清空對應的專屬欄位
 * @param formData 表單資料 ref
 */
export function bindTypeEffects(formData: Ref<DemandFormData>) {
  watch(
    () => formData.value.type,
    (newType, oldType) => {
      if (newType === oldType) return;

      // 當類型不是 human 時，清空人力需求欄位
      if (newType !== "human") {
        formData.value.humanNeed = { required: "", riskNotes: "" };
      }

      // 當類型不是 supply 時，重設物資項目為一筆空白項目
      if (newType !== "supply") {
        formData.value.supplyItems = [{ itemName: "", quantity: "", unit: "" }];
      }
    },
  );
}
