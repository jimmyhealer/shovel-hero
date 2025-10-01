/**
 * 需求服務
 * 處理所有需求相關的 Firestore 操作
 * 對齊 SRS (plan.md section 10, 11, 12)
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type Query,
  type DocumentData,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Demand,
  DemandType,
} from "@/types/firestore";

/**
 * 建立新需求
 * 對齊 SRS：publishTime = now + 30 分鐘
 */
export async function createDemand(data: Partial<Demand>): Promise<string> {
  const now = Timestamp.now();
  const publishTime = Timestamp.fromMillis(now.toMillis() + 30 * 60 * 1000); // +30 分鐘

  const demandData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    publishTime,
  };

  const docRef = await addDoc(collection(db, "demands"), demandData);
  return docRef.id;
}

/**
 * 更新需求（管理員專用）
 */
export async function updateDemand(
  demandId: string,
  data: Partial<Demand>,
): Promise<void> {
  const demandRef = doc(db, "demands", demandId);
  await updateDoc(demandRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * 刪除需求（管理員專用）
 */
export async function deleteDemand(demandId: string): Promise<void> {
  const demandRef = doc(db, "demands", demandId);
  await deleteDoc(demandRef);
}

/**
 * 取得單一需求
 */
export async function getDemand(demandId: string): Promise<Demand | null> {
  const demandRef = doc(db, "demands", demandId);
  const demandSnap = await getDoc(demandRef);

  if (!demandSnap.exists()) {
    return null;
  }

  return {
    id: demandSnap.id,
    ...demandSnap.data(),
  } as Demand;
}

/**
 * 查詢需求列表（訪客視角）
 * 對齊 SRS：只取得 publishTime <= now 的需求
 */
export async function getPublishedDemands(
  filters?: {
    type?: DemandType;
    region?: string;
    limitCount?: number;
  },
): Promise<Demand[]> {
  const now = Timestamp.now();
  const demandsRef = collection(db, "demands");

  let q: Query<DocumentData> = query(
    demandsRef,
    where("publishTime", "<=", now),
    orderBy("publishTime", "desc"),
  );

  if (filters?.type) {
    q = query(q, where("type", "==", filters.type));
  }

  if (filters?.region) {
    q = query(q, where("region", "==", filters.region));
  }

  if (filters?.limitCount) {
    q = query(q, limit(filters.limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Demand,
  );
}

/**
 * 查詢所有需求（管理員視角）
 */
export async function getAllDemands(
  filters?: {
    type?: DemandType;
  },
): Promise<Demand[]> {
  const demandsRef = collection(db, "demands");

  let q: Query<DocumentData> = query(
    demandsRef,
    orderBy("createdAt", "desc"),
  );

  if (filters?.type) {
    q = query(q, where("type", "==", filters.type));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Demand,
  );
}

/**
 * 即時監聽需求列表（用於地圖）
 */
export function subscribeToPublishedDemands(
  callback: (demands: Demand[]) => void,
  filters?: {
    type?: DemandType;
    region?: string;
  },
): Unsubscribe {
  const now = Timestamp.now();
  const demandsRef = collection(db, "demands");

  let q: Query<DocumentData> = query(
    demandsRef,
    where("publishTime", "<=", now),
    orderBy("publishTime", "desc"),
  );

  if (filters?.type) {
    q = query(q, where("type", "==", filters.type));
  }

  if (filters?.region) {
    q = query(q, where("region", "==", filters.region));
  }

  return onSnapshot(q, (snapshot) => {
    const demands = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Demand,
    );
    callback(demands);
  });
}
