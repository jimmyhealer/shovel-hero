/**
 * 統計與輔助函數服務
 * 處理統計相關的 Firestore 操作
 * 對齊 SRS (plan.md section 10, 11, 12)
 */

import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

/**
 * 統計需求的報名人數
 */
export async function countApprovedApplications(
  demandId: string,
): Promise<number> {
  const now = Timestamp.now();
  const appsRef = collection(db, "volunteerApplications");

  const q = query(
    appsRef,
    where("demandId", "==", demandId),
    where("publishTime", "<=", now),
    where("status", "==", "approved"),
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * 統計需求的捐贈數量
 */
export async function countApprovedDonations(demandId: string): Promise<number> {
  const now = Timestamp.now();
  const donationsRef = collection(db, "donations");

  const q = query(
    donationsRef,
    where("demandId", "==", demandId),
    where("publishTime", "<=", now),
    where("status", "==", "approved"),
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}
