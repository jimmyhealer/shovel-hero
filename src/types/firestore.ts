/**
 * Firestore 資料模型定義
 * 對齊 SRS (plan.md section 10)
 */

import type { Timestamp } from "firebase/firestore";

// ============= 共用類型 =============

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Contact {
  name: string;
  phone: string;
  email?: string;
}

export interface Applicant {
  name: string;
  phone: string;
}

export interface Donor {
  name: string;
  phone: string;
}

// ============= Demands 需求 =============

export type DemandType =
  | "human"
  | "supply"
  | "site-holding"
  | "site-parking"
  | "site-stay"
  | "site-food";


export interface HumanNeed {
  required: number;
  riskNotes: string;
}

export interface SupplyItem {
  itemName: string;
  quantity: number;
  unit: string;
}

export interface BaseDemand {
  id: string;
  type: DemandType;
  title?: string;
  description: string;
  region: string;
  location: Location;
  contact: Contact;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishTime: Timestamp; // 審核機制：只顯示 publishTime <= now 的資料
  approvedAt?: Timestamp;
  approvedBy?: string;
}

export interface HumanDemand extends BaseDemand {
  type: "human";
  humanNeed: HumanNeed;
  appliedCount?: number;
}

export interface SupplyDemand extends BaseDemand {
  type: "supply";
  supplyItems: SupplyItem[];
  donationCount?: number;
  // 即時計算：尚需的物資清單（以原 SupplyItem 結構表示剩餘數量）
  remainingSupplyItems?: SupplyItem[];
}

export interface SiteDemand extends BaseDemand {
  type: "site-holding" | "site-parking" | "site-stay" | "site-food";
}

export type Demand = HumanDemand | SupplyDemand | SiteDemand;

// ============= Volunteer Applications 志工報名 =============


export interface VolunteerApplication {
  id: string;
  demandId: string;
  applicant: Applicant;
  availableTime: string;
  skills: string[];
  tools: string[];
  note: string;
  createdAt: Timestamp;
  publishTime: Timestamp; // 審核機制：2 小時後自動通過
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

// ============= Donations 物資捐贈 =============


export interface Donation {
  id: string;
  demandId: string;
  donor: Donor;
  itemName: string;
  quantity: number;
  unit: string;
  eta: string;
  note: string;
  createdAt: Timestamp;
  publishTime: Timestamp; // 審核機制：2 小時後自動通過
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

// ============= Comments 留言 =============

export interface Comment {
  id: string;
  demandId: string;
  author: {
    displayName: string;
  };
  body: string;
  createdAt: Timestamp;
  removed: boolean;
  removedBy?: string;
}

// ============= Approvals 審核紀錄 =============

export type ApprovalAction = "approve" | "reject" | "autoApprove";

export interface Approval {
  id: string;
  target: {
    collection: string;
    id: string;
  };
  action: ApprovalAction;
  by: string;
  at: Timestamp;
  reason?: string;
}

// ============= Notifications 通知 =============

export type NotificationStatus = "queued" | "sent" | "failed";

export interface Notification {
  id: string;
  to: {
    email: string;
  };
  template: string;
  payload: Record<string, any>;
  status: NotificationStatus;
  createdAt: Timestamp;
  sentAt?: Timestamp;
}

// ============= Audit Logs 稽核紀錄 =============

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: Timestamp;
  meta?: Record<string, any>;
}

// ============= Users 使用者（管理員）=============

export type UserRole = "admin" | "staff";

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  disabled: boolean;
}

