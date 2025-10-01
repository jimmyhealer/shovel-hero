/**
 * 表單輸入介面定義
 * 與 Firestore 類型區分：表單允許字串數字、選填欄位
 * 對齊 SRS (plan.md section 10)
 */

import type { DemandType } from "./firestore";

// 物資項目輸入介面（表單用，允許字串數字）
export interface SupplyItemInput {
  itemName: string;
  quantity: string;
  unit: string;
}

// 需求表單資料介面
export interface DemandFormData {
  type: DemandType;
  title: string;
  description: string;
  region: string;
  location: {
    lat: number | null;
    lng: number | null;
    address: string;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  humanNeed: {
    required: string;
    riskNotes: string;
  };
  supplyItems: SupplyItemInput[];
}

// 選項介面
export interface SelectOption {
  value: string;
  label: string;
}
