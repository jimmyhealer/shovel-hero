/**
 * 表單提交處理
 * 負責表單驗證、資料轉換和提交到 Firestore
 */

import { createDemand } from "@/services";
import { useToastStore } from "@/stores/toast";
import { validateForm } from "./validation";
import { toDemandPayload } from "./mapper";
import { reset } from "./state";
import type { Ref } from "vue";
import type { DemandFormData } from "@/types/forms";

/**
 * 處理表單提交
 * 對齊 SRS：demands 建立流程（plan.md section 12）
 * @param formData 表單資料 ref
 * @param isSubmitting 提交狀態 ref
 * @param errors 錯誤訊息 ref
 * @returns 提交是否成功
 */
export async function handleSubmit(
  formData: Ref<DemandFormData>,
  isSubmitting: Ref<boolean>,
  errors: Ref<Record<string, string>>
): Promise<boolean> {
  const toastStore = useToastStore();

  // 驗證表單
  if (!validateForm(formData, errors)) {
    toastStore.error("請檢查表單內容");
    return false;
  }

  isSubmitting.value = true;

  try {
    // 轉換資料為 Firestore 格式
    const payload = toDemandPayload(formData);

    // 提交到 Firestore
    // publishTime 會自動設為 now + 30 分鐘
    const demandId = await createDemand(payload);

    toastStore.success("需求已提交！審核時間最長 30 分鐘。");
    console.log("需求已建立，ID:", demandId);

    // 清空表單
    reset(formData, errors);

    return true;
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
    return false;
  } finally {
    isSubmitting.value = false;
  }
}
