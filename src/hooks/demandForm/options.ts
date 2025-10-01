/**
 * 表單選項常數
 * 對齊 SRS：需求類型定義（plan.md section 10）
 */

import type { SelectOption } from "@/types/forms";

/**
 * 需求類型選項
 */
export const typeOptions: SelectOption[] = [
  { value: "human", label: "人力任務" },
  { value: "supply", label: "物資需求" },
  { value: "site-holding", label: "污泥暫置場" },
  { value: "site-parking", label: "物資停放處" },
  { value: "site-stay", label: "住宿地點" },
  { value: "site-food", label: "領吃食區域" },
];

/**
 * 區域選項
 * 目前僅支援花蓮縣
 */
export const regionOptions: SelectOption[] = [
  { value: "花蓮縣", label: "花蓮縣" },
];
