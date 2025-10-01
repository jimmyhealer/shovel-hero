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
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Donation } from "@/types/firestore";

/**
 * 建立物資捐贈（立即公開）
 */
export async function createDonation(
  data: Omit<
    Donation,
    "id" | "createdAt" | "publishTime"
  >,
): Promise<string> {
  const now = Timestamp.now();
  const donationData = {
    ...data,
    createdAt: now,
    // 立即可見：publishTime 設為現在
    publishTime: now,
  };

  const docRef = await addDoc(collection(db, "donations"), donationData);
  return docRef.id;
}

/**
 * 取得需求的物資捐贈列表
 */
export async function getDonationsByDemand(
  demandId: string,
): Promise<Donation[]> {
  const donationsRef = collection(db, "donations");

  const q = query(
    donationsRef,
    where("demandId", "==", demandId),
    orderBy("createdAt", "desc"),
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
 * 即時監聽某需求的捐贈數量
 */
export function subscribeDonationCount(
  demandId: string,
  callback: (count: number) => void,
): Unsubscribe {
  const donationsRef = collection(db, "donations");
  const q = query(donationsRef, where("demandId", "==", demandId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * 即時監聽某需求的捐贈列表（用於彙總數量）
 */
export function subscribeDonationsByDemand(
  demandId: string,
  callback: (donations: Donation[]) => void,
): Unsubscribe {
  const donationsRef = collection(db, "donations");
  const q = query(donationsRef, where("demandId", "==", demandId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Donation[];
    callback(list);
  });
}

/**
 * 查詢所有物資捐贈（管理員視角）
 */
export async function getAllDonations(filters?: {
  demandId?: string;
}): Promise<Donation[]> {
  const donationsRef = collection(db, "donations");

  let q: Query<DocumentData> = query(
    donationsRef,
    orderBy("createdAt", "desc"),
  );

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
