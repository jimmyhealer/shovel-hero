# 開發指南

## 🎯 當前進度

已完成基礎架構設置，包括：
- ✅ Vue 3 + Vite + Tailwind CSS
- ✅ Vue Router 路由系統
- ✅ Pinia 狀態管理
- ✅ Leaflet 地圖整合
- ✅ 響應式布局（地圖 + 詳情面板）
- ✅ 基本 UI 組件
- ✅ Firebase 配置框架

## 📋 接下來的開發步驟

### 1. Firebase 設置（優先）

#### 1.1 建立 Firebase 專案
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用以下服務：
   - Authentication (Google 登入)
   - Firestore Database
   - Cloud Functions
   - Hosting

#### 1.2 配置環境變數
```bash
cp .env.example .env
# 填入 Firebase 配置
```

#### 1.3 設置 Firestore 資料結構
根據 `plan.md` 第 10 節建立以下集合：
- `users` - 管理員與用戶資料
- `demands` - 需求資料（人力、物資、場站）
- `volunteerApplications` - 志工報名
- `donations` - 物資捐贈
- `comments` - 討論區留言
- `approvals` - 審核紀錄
- `notifications` - 通知紀錄
- `auditLogs` - 稽核日誌

#### 1.4 設置 Security Rules
參考 `plan.md` 第 11 節設置適當的安全規則。

### 2. 實作 Firebase Auth 整合

#### 需要實作的檔案：
- `src/stores/auth.js` - 實作 Firebase Auth 邏輯
- `src/components/Auth/LoginButton.vue` - 登入按鈕
- `src/components/Auth/UserMenu.vue` - 用戶選單
- `src/App.vue` - 添加 Auth 狀態監聽器

#### 範例程式碼：
```javascript
// src/stores/auth.js
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/config/firebase'

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  setUser(result.user)
}
```

### 3. 實作地圖與 Firestore 整合

#### 3.1 載入需求資料
在 `src/components/Map/MapView.vue` 中：
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

async function loadDemands() {
  const q = query(
    collection(db, 'demands'),
    where('status', '==', 'approved')
  )
  const snapshot = await getDocs(q)
  const demands = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  mapStore.setDemands(demands)
}
```

#### 3.2 即時更新
使用 Firestore 的 `onSnapshot` 來實現即時更新：
```javascript
import { onSnapshot } from 'firebase/firestore'

onSnapshot(q, (snapshot) => {
  // 更新地圖標記
})
```

### 4. 實作表單組件

#### 4.1 志工報名表單
建立 `src/components/Forms/VolunteerForm.vue`

需要的欄位：
- 姓名、電話、Email
- 可服務時間
- 專業技能（多選）
- 攜帶工具
- 備註

#### 4.2 物資捐贈表單
建立 `src/components/Forms/DonationForm.vue`

需要的欄位：
- 姓名、電話
- 物資名稱、數量、單位
- 預計送達時間
- 備註

#### 4.3 需求建立表單（管理員用）
建立 `src/components/Forms/DemandForm.vue`

支援建立：
- 人力需求
- 物資需求
- 場站資訊

#### 4.4 本地儲存草稿
使用 `localStorage` 儲存表單草稿：
```javascript
// 儲存
localStorage.setItem('volunteer-draft', JSON.stringify(formData))

// 讀取
const draft = JSON.parse(localStorage.getItem('volunteer-draft'))
```

### 5. 實作管理後台

#### 5.1 審核列表
建立 `src/components/Admin/ApprovalList.vue`

功能：
- 顯示待審核項目
- 快速審核（通過/退回）
- 查看詳細資訊
- 批次操作

#### 5.2 審核詳情
建立 `src/components/Admin/ApprovalDetail.vue`

功能：
- 顯示完整資訊
- 審核操作（通過/退回/編輯）
- 審核歷史記錄

#### 5.3 資料管理
建立以下組件：
- `src/components/Admin/DemandManager.vue` - 需求管理
- `src/components/Admin/UserManager.vue` - 用戶管理
- `src/components/Admin/AuditLog.vue` - 稽核日誌

### 6. 實作 Cloud Functions

在專案根目錄建立 `functions/` 資料夾：

```bash
cd functions
npm init -y
npm install firebase-functions firebase-admin
```

#### 6.1 自動審核函數
```javascript
// functions/index.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')

exports.autoApproveDemands = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    // 檢查逾時的需求
    // 自動審核通過
  })
```

#### 6.2 Email 通知函數
```javascript
exports.sendNotification = functions.firestore
  .document('demands/{demandId}')
  .onCreate(async (snap, context) => {
    // 寄送 Email 通知
  })
```

### 7. 實作討論區功能

#### 建立組件：
- `src/components/Comments/CommentList.vue`
- `src/components/Comments/CommentForm.vue`

功能：
- 顯示留言列表
- 發表新留言
- 管理員刪除不當留言

### 8. 實作通知系統

#### 8.1 Email 通知
整合 Email 服務（建議使用 SendGrid 或 Mailgun）

#### 8.2 瀏覽器通知
使用 Web Notification API

### 9. 效能優化

#### 9.1 地圖標記聚合
安裝並使用 Leaflet.markercluster：
```bash
bun add leaflet.markercluster
```

#### 9.2 圖片優化
- 使用 WebP 格式
- 實作 lazy loading

#### 9.3 程式碼分割
確保使用動態 import：
```javascript
const Admin = () => import('./views/Admin.vue')
```

### 10. 測試

#### 10.1 單元測試
安裝測試工具：
```bash
bun add -D vitest @vue/test-utils
```

#### 10.2 E2E 測試
考慮使用 Playwright 或 Cypress

### 11. 部署

#### 11.1 Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

#### 11.2 CI/CD
設置 GitHub Actions：
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: bun install
      - run: bun run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
```

## 🔍 開發注意事項

### 程式碼風格
- 使用 ESLint 和 Prettier
- 遵循 Vue 3 Composition API 風格
- 組件命名使用 PascalCase

### 資料安全
- 永遠不要在前端暴露敏感資訊
- 使用 Firestore Security Rules 保護資料
- 驗證所有用戶輸入

### 效能考量
- 實作分頁和虛擬滾動
- 使用 Firestore 查詢限制
- 避免不必要的即時監聽

### 可訪問性（A11y）
- 使用語義化 HTML
- 提供 ARIA 標籤
- 確保鍵盤導航
- 達到 WCAG AA 標準

## 📚 參考資源

- [Vue 3 文檔](https://vuejs.org/)
- [Vite 文檔](https://vitejs.dev/)
- [Pinia 文檔](https://pinia.vuejs.org/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [Leaflet 文檔](https://leafletjs.com/)
- [Firebase 文檔](https://firebase.google.com/docs)
- [Radix Vue 文檔](https://www.radix-vue.com/)

## 🐛 已知問題

無

## 💡 改進建議

1. 考慮添加 PWA 支援（離線功能）
2. 實作多語言支援（i18n）
3. 添加深色模式
4. 實作進階搜尋和篩選
5. 添加資料視覺化（圖表）

---

最後更新：2025-10-01

