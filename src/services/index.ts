/**
 * Firestore 服務層匯出文件
 * 統一匯出所有 Firestore 操作介面
 * 對齊 SRS (plan.md section 10, 11, 12)
 */

// Demands 需求服務
export {
  createDemand,
  updateDemand,
  deleteDemand,
  getDemand,
  getPublishedDemands,
  getAllDemands,
  subscribeToPublishedDemands,
} from "./demands";

// Volunteer Applications 志工報名服務
export {
  createVolunteerApplication,
  getVolunteerApplicationsByDemand,
  getAllVolunteerApplications,
  subscribeVolunteerApplicationCount,
} from "./volunteerApplications";

// Donations 物資捐贈服務
export {
  createDonation,
  getDonationsByDemand,
  getAllDonations,
  subscribeDonationCount,
  subscribeDonationsByDemand,
} from "./donations";

// Comments 留言服務
export {
  createComment,
  getCommentsByDemand,
  removeComment,
} from "./comments";

// Statistics 統計與輔助函數
export {
  countApprovedApplications,
  countApprovedDonations,
} from "./statistics";
