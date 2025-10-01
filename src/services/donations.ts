/**
 * 物資捐贈服務
 * 處理所有物資捐贈相關的 Firestore 操作
 * 對齊 SRS (plan.md section 10, 11, 12)
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Donation } from "@/types/firestore";

/**
 * 建立物資捐贈
 * 對齊 SRS：publishTime = now + 2 小時
 */
export async function createDonation(
  data: Omit<
    Donation,
    "id" | "status" | "createdAt" | "publishTime" | "autoApproved"
  >,
): Promise<string> {
  const now = Timestamp.now();
  const publishTime = Timestamp.fromMillis(now.toMillis() + 2 * 60 * 60 * 1000); // +2 小時

  const donationData = {
    ...data,
    status: "pending",
    createdAt: now,
    publishTime,
    autoApproved: false,
  };

  const docRef = await addDoc(collection(db, "donations"), donationData);
  return docRef.id;
}

/**
 * 更新物資捐贈狀態（管理員專用）
 */
export async function updateDonation(
  donationId: string,
  data: Partial<Donation>,
): Promise<void> {
  const donationRef = doc(db, "donations", donationId);
  await updateDoc(donationRef, data);
}

/**
 * 取得需求的物資捐贈列表
 */
export async function getDonationsByDemand(
  demandId: string,
): Promise<Donation[]> {
  const now = Timestamp.now();
  const donationsRef = collection(db, "donations");

  const q = query(
    donationsRef,
    where("demandId", "==", demandId),
    where("publishTime", "<=", now),
    where("status", "==", "approved"),
    orderBy("publishTime", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Donation,
  );
}

/**
 * 查詢所有物資捐贈（管理員視角）
 */
export async function getAllDonations(filters?: {
  status?: string;
  demandId?: string;
}): Promise<Donation[]> {
  const donationsRef = collection(db, "donations");

  let q: Query<DocumentData> = query(
    donationsRef,
    orderBy("createdAt", "desc"),
  );

  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }

  if (filters?.demandId) {
    q = query(q, where("demandId", "==", filters.demandId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Donation,
  );
}
