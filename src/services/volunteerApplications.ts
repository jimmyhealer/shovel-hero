/**
 * 志工報名服務
 * 處理所有志工報名相關的 Firestore 操作
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
import type { VolunteerApplication } from "@/types/firestore";

/**
 * 建立志工報名（立即公開）
 */
export async function createVolunteerApplication(
  data: Omit<
    VolunteerApplication,
    "id" | "createdAt" | "publishTime"
  >,
): Promise<string> {
  const now = Timestamp.now();
  // 立即可見：publishTime 設為現在
  const applicationData = {
    ...data,
    createdAt: now,
    publishTime: now,
  };

  const docRef = await addDoc(
    collection(db, "volunteerApplications"),
    applicationData,
  );
  return docRef.id;
}

/**
 * 取得需求的志工報名列表
 */
export async function getVolunteerApplicationsByDemand(
  demandId: string,
): Promise<VolunteerApplication[]> {
  const appsRef = collection(db, "volunteerApplications");

  const q = query(
    appsRef,
    where("demandId", "==", demandId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as VolunteerApplication,
  );
}

/**
 * 即時監聽某需求的志工報名數量
 */
export function subscribeVolunteerApplicationCount(
  demandId: string,
  callback: (count: number) => void,
): Unsubscribe {
  const appsRef = collection(db, "volunteerApplications");
  const q = query(appsRef, where("demandId", "==", demandId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * 查詢所有志工報名（管理員視角）
 */
export async function getAllVolunteerApplications(filters?: {
  demandId?: string;
}): Promise<VolunteerApplication[]> {
  const appsRef = collection(db, "volunteerApplications");

  let q: Query<DocumentData> = query(appsRef, orderBy("createdAt", "desc"));

  if (filters?.demandId) {
    q = query(q, where("demandId", "==", filters.demandId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as VolunteerApplication,
  );
}
