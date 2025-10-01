/**
 * 留言服務
 * 處理所有留言相關的 Firestore 操作
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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Comment } from "@/types/firestore";

/**
 * 建立留言
 */
export async function createComment(
  data: Omit<Comment, "id" | "createdAt" | "removed">,
): Promise<string> {
  const commentData = {
    ...data,
    createdAt: Timestamp.now(),
    removed: false,
  };

  const docRef = await addDoc(collection(db, "comments"), commentData);
  return docRef.id;
}

/**
 * 取得需求的留言列表
 */
export async function getCommentsByDemand(
  demandId: string,
): Promise<Comment[]> {
  const commentsRef = collection(db, "comments");

  const q = query(
    commentsRef,
    where("demandId", "==", demandId),
    where("removed", "==", false),
    orderBy("createdAt", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Comment,
  );
}

/**
 * 移除留言（管理員專用）
 */
export async function removeComment(
  commentId: string,
  removedBy: string,
): Promise<void> {
  const commentRef = doc(db, "comments", commentId);
  await updateDoc(commentRef, {
    removed: true,
    removedBy,
  });
}
