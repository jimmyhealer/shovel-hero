鏟子英雄 2.0 - 軟體需求規格書（SRS）

## 1. 專案簡介

鏟子英雄 2.0 是一個救援對接媒合平台，提供災區人力需求、物資需求、場站資訊等之集中發布與媒合，以一個全屏互動地圖為核心，讓志工、捐贈者與管理員能快速掌握狀況並行動。平台著重行動裝置友善（RWD）、低門檻參與（志工免登入）、與明確的審核制度（逾時自動審核）。

## 2. 目標與成功指標

- **目標**：
  - 建立一個可視覺化的救援需求地圖，集中呈現人力、物資與場站。
  - 降低志工與捐贈者的參與摩擦，讓提交與媒合流程簡單明確。
  - 提供可稽核、可追蹤的審核制度（含逾時自動審核）。
- **成功指標（Metrics）**：
  - 需求建立至審核通過的中位時間 ≤ 30 分鐘。
  - 志工報名成功率 ≥ 80%。
  - 首屏地圖載入時間（3G 快取冷啟）≤ 3 秒。
  - 月活管理員審核覆蓋率 ≥ 95%。

## 3. 範圍（In Scope）與不在範圍（Out of Scope）

- **In Scope**：
  - 全屏地圖與圖丁展示、詳情面板。
  - 表單：人力需求、物資需求、志工報名、物資捐贈、討論區貼文。
  - 審核流程：新需求、志工報名、物資捐贈的審核與逾時自動審核。
  - 通知：Email 通知管理員與需求方。
  - 後台管理（最小可行版）：審核、搜尋、篩選、編修、下架。

## 4. 角色與權限

- **訪客/志工/捐贈者（免登入）**：
  - 瀏覽地圖與公開資訊。
  - 提交志工報名與物資捐贈表單。
  - 使用瀏覽器本地快取記住上次填寫（避免重複填寫）。
- **管理員（需登入，Google/Firebase Auth）**：
  - 新增/編輯/下架需求、審核各項提交。
  - 管理公告、場站資料。
  - 檢視審核紀錄、操作稽核、匯出資料。

## 5. 使用情境（高階流程）

- **建立人力/物資需求**：需求方填寫表單 → 系統寄信通知管理員 → 管理員登入審核 → 通過後在地圖顯示；若 30 分鐘未審核，系統自動審核通過。
- **志工報名/物資捐贈**：使用者送出表單 → 系統寄信通知管理員與需求方 → 管理員登入審核 → 通過後更新需求狀態；若 2 小時未審核，自動審核通過。

## 6. 地圖與圖丁

- **地圖技術**：Leaflet + OSM，支援放大縮小、定位、聚合。
- **圖丁類型**：
  - 人力任務
  - 污泥暫置場
  - 物資停放處
  - 住宿地點
  - 領吃食區域
- **圖丁互動**：
  - 點擊圖丁後，詳情面板從右側滑入，同時地圖區域往左側移動，呈現分欄式佈局。
  - 詳情面板顯示基本資訊、需求狀態、行動按鈕（報名、捐贈、分享）。
  - 支援依類型、狀態、時間排序與篩選；關鍵字搜尋（地名、需求名）。

## 7. 表單與資訊架構

### 7.1 基本欄位（任務/需求）

- 所屬災區/區域、類型、集合地點、聯絡方式（姓名、電話、Email）、人數/數量需求、風險注意事項、描述、狀態（草稿/待審/通過/退回/下架）、建立時間、最後更新時間。

### 7.2 志工報名

- 欄位：姓名、電話、可服務時間、專業技能（逗號分隔）、攜帶工具（逗號分隔）、備註。
- 需求方可見報名列表（通過後），隱私資訊僅管理員可見。
- 免登入體驗：
  - 瀏覽器本地快取上次填寫內容（可覆蓋/清除）。
  - 後端以「姓名 + 電話」做輕量去重建議（不強制合併）。

### 7.3 物資捐贈

- 欄位：姓名、電話、物資名稱、捐贈數量、單位、預計送達時間、備註。

### 7.4 討論區（每個需求一個討論串）

- 可張貼文字留言；可由管理員移除不當內容；顯示時間戳與作者暱稱。

## 8. 審核制度

- **建立需求**：
  - 流程：提交 → 寄信管理員 → 管理員審核（通過/退回/下架）。
  - 逾時自動審核：30 分鐘未處理則自動通過並上線，寫入審核紀錄與通知。
- **志工報名、物資捐贈**：
  - 流程：提交 → 寄信管理員與需求方 → 管理員審核。
  - 逾時自動審核：2 小時未處理則自動通過並更新需求統計，寫入審核紀錄與通知。

## 9. 技術架構與堆疊

- PM: bun
- 前端：Vue 3 + Vite + Tailwind CSS + shadcn-vue、Leaflet、Pinia（狀態管理）。
- 後端：Firebase（Firestore、Cloud Functions、Auth、Hosting、Storage 可選）。
- 部署：Firebase Hosting；CI/CD（GitHub Actions）。

## 10. Firestore 資料模型（草案）

- `users`（管理員/需求方檔案）
  - uid, role: admin|staff, name, email, phone, createdAt, updatedAt, disabled
- `demands`（統一需求集合，type 區分）
  - id, type: human|supply|site-holding|site-parking|site-stay|site-food
  - title, description, region, location: {lat, lng, address}
  - contact: {name, phone, email}
  - humanNeed: {required, riskNotes}?（type=human 時）
  - supplyNeed: {itemName, quantity, unit}?（type=supply 時）
  - status: draft|pending|approved|rejected|archived
  - createdBy, createdAt, updatedAt, approvedAt, approvedBy, autoApproved: boolean
- `volunteerApplications`
  - id, demandId, applicant: {name, phone}, availableTime, skills[], tools[], note
  - status: pending|approved|rejected, createdAt, reviewedAt, reviewedBy, autoApproved
- `donations`
  - id, demandId, donor: {name, phone}, itemName, quantity, unit, eta, note
  - status: pending|approved|rejected, createdAt, reviewedAt, reviewedBy, autoApproved
- `comments`（子集合或獨立集合，與 demandId 關聯）
  - id, demandId, author: {displayName}, body, createdAt, removed: boolean, removedBy
- `approvals`
  - id, target: {collection, id}, action: approve|reject|autoApprove, by, at, reason
- `notifications`
  - id, to: {email}, template, payload, status: queued|sent|failed, createdAt, sentAt
- `auditLogs`
  - id, actor, action, target, at, meta

索引建議：

- `demands` 上 `status`, `type`, `region`, `createdAt` 複合索引。
- `volunteerApplications`/`donations` 上 `status`, `demandId`, `createdAt`。

## 11. 安全與權限（Firestore Security Rules 摘要）

- 訪客可讀取 `demands` 中 `approved` 狀態與公共場站資料。
- 訪客可建立 `volunteerApplications` 與 `donations`（寫入時僅允許必要欄位）。
- 只有管理員可寫入/修改 `demands`、變更狀態、刪除留言。
- 系統服務（Functions）可寫入 `approvals`、`auditLogs`、`notifications`。
- 所有寫入皆需欄位白名單驗證與長度/格式限制（電話、Email）。

## 12. Cloud Functions / API 設計

- HTTP/Callable（最小化）：
  - `POST /api/demands`（管理員）建立或編輯需求。
  - `POST /api/volunteers/apply`（公開）建立志工報名。
  - `POST /api/donations`（公開）建立物資捐贈。
- 觸發器：
  - `onCreate(demands)`：寄送管理員審核通知；建立 30 分鐘自動審核排程標記。
  - `onCreate(volunteerApplications|donations)`：寄送管理員與需求方通知；建立 2 小時自動審核排程標記。
  - `onWrite(*)`：寫入 `auditLogs`。
- 排程（Scheduler）：
  - 每 5 分鐘掃描逾時未審核項目，執行自動審核並寄送通知。
- 通知（Email）模板：
  - 管理員待審提醒、審核結果通知、需求方新報名/捐贈提醒、系統自動審核通知。

## 13. 前端 UX / RWD / 可近用（A11y）

- RWD：手機優先，支援地圖與詳情面板的分欄式佈局（桌面端）與全屏切換（手機端）。
- 地圖互動：
  - 點擊圖丁觸發動畫：詳情面板從右側滑入，地圖區域平滑往左移動。
  - 關閉詳情面板時，地圖區域回到全屏狀態。
- 表單體驗：
  - 自動儲存草稿到瀏覽器本地；再次開啟預填上次資料。
  - 清楚的欄位驗證與錯誤提示；進度保存。
- A11y：
  - 鍵盤可操作、焦點可見、色彩對比達標（WCAG AA）。
  - 圖丁與按鈕提供 ARIA 標籤與可讀名稱。
