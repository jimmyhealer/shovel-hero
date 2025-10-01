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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { VolunteerApplication } from "@/types/firestore";

/**
 * 建立志工報名
 * 對齊 SRS：publishTime = now + 2 小時
 */
export async function createVolunteerApplication(
  data: Omit<
    VolunteerApplication,
    "id" | "status" | "createdAt" | "publishTime" | "autoApproved"
  >,
): Promise<string> {
  const now = Timestamp.now();
  const publishTime = Timestamp.fromMillis(now.toMillis() + 2 * 60 * 60 * 1000); // +2 小時

  const applicationData = {
    ...data,
    status: "pending",
    createdAt: now,
    publishTime,
    autoApproved: false,
  };

  const docRef = await addDoc(
    collection(db, "volunteerApplications"),
    applicationData,
  );
  return docRef.id;
}

/**
 * 更新志工報名狀態（管理員專用）
 */
export async function updateVolunteerApplication(
  applicationId: string,
  data: Partial<VolunteerApplication>,
): Promise<void> {
  const appRef = doc(db, "volunteerApplications", applicationId);
  await updateDoc(appRef, data);
}

/**
 * 取得需求的志工報名列表
 */
export async function getVolunteerApplicationsByDemand(
  demandId: string,
): Promise<VolunteerApplication[]> {
  const now = Timestamp.now();
  const appsRef = collection(db, "volunteerApplications");

  const q = query(
    appsRef,
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
      }) as VolunteerApplication,
  );
}

/**
 * 查詢所有志工報名（管理員視角）
 */
export async function getAllVolunteerApplications(filters?: {
  status?: string;
  demandId?: string;
}): Promise<VolunteerApplication[]> {
  const appsRef = collection(db, "volunteerApplications");

  let q: Query<DocumentData> = query(appsRef, orderBy("createdAt", "desc"));

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
      }) as VolunteerApplication,
  );
}
