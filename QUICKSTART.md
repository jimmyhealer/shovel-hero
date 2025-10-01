# 🚀 快速開始指南

## 立即查看應用

開發伺服器已經在運行中！

1. 打開瀏覽器訪問：**http://localhost:5173**

2. 你應該會看到：
   - ✅ 全螢幕互動式地圖（台灣中心）
   - ✅ 左上角的篩選欄
   - ✅ 兩個示例標記點（藍色和綠色）
   - ✅ 點擊標記可開啟右側詳情面板
   - ✅ 地圖會自動調整以容納面板

## 目前可用功能

### 地圖功能
- 🗺️ OpenStreetMap 底圖
- 📍 可點擊的需求標記（不同顏色代表不同類型）
- 🔍 放大縮小和拖曳
- 📱 響應式設計（手機和桌面都可用）

### 詳情面板
- 📝 顯示需求詳細資訊
- 🏷️ 類型標籤（人力任務、物資需求等）
- 📍 地點資訊
- 📞 聯絡資訊
- ✨ 平滑的滑入動畫

### 篩選功能
- 🎯 依類型篩選（人力、物資、場站等）
- ✅ 依狀態篩選（已通過、待審核）
- 📍 依地區篩選（北中南東）
- 🔢 顯示結果數量

### 路由系統
- `/` - 主頁（地圖視圖）
- `/admin` - 管理後台（開發中）

## 測試應用

### 1. 測試地圖互動
```
1. 點擊地圖上的藍色標記（人力任務）
2. 觀察右側面板滑入動畫
3. 查看需求詳情
4. 點擊 X 按鈕關閉面板
5. 地圖會回到全屏狀態
```

### 2. 測試篩選功能
```
1. 點擊左上角的篩選欄
2. 選擇不同的類型（例如：物資需求）
3. 地圖上的標記會即時更新
4. 結果數量也會更新
5. 點擊「重設篩選」回到預設狀態
```

### 3. 測試響應式設計
```
1. 按 F12 開啟開發者工具
2. 切換到行動裝置模擬模式
3. 測試不同螢幕尺寸下的佈局
4. 詳情面板在手機上會是全螢幕
```

### 4. 測試管理後台
```
1. 訪問 http://localhost:5173/admin
2. 查看管理後台的基本佈局
3. （功能還在開發中）
```

## 目前使用的模擬資料

應用目前使用以下模擬資料：

```javascript
{
  id: '1',
  type: 'human',
  title: '清理淹水區域',
  location: { lat: 23.5, lng: 121.0, address: '台灣某地' },
  status: 'approved'
}
```

## 下一步要做什麼？

### 🔥 優先事項：設置 Firebase

1. **建立 Firebase 專案**
   - 前往 https://console.firebase.google.com/
   - 建立新專案「shovel-heroes」

2. **啟用必要服務**
   - ✅ Authentication（啟用 Google 登入）
   - ✅ Firestore Database
   - ✅ Cloud Functions
   - ✅ Hosting

3. **配置環境變數**
   ```bash
   cp .env.example .env
   # 填入 Firebase 配置資訊
   ```

4. **測試 Firebase 連線**
   - 重新啟動開發伺服器
   - 檢查 Console 是否有 Firebase 初始化訊息

### 📝 接下來的功能

參考 `DEVELOPMENT.md` 檔案了解完整的開發計畫：

1. **Firebase Auth 整合** - 實作 Google 登入
2. **Firestore 資料載入** - 從資料庫載入真實需求
3. **表單開發** - 志工報名和物資捐贈表單
4. **管理後台** - 審核系統和資料管理
5. **自動審核** - Cloud Functions 實作
6. **通知系統** - Email 通知

## 有用的指令

```bash
# 重新啟動開發伺服器（如果停止）
bun run dev

# 建置生產版本
bun run build

# 預覽生產版本
bun run preview

# 安裝新依賴
bun add <package-name>

# 檢查專案結構
tree -L 3 -I node_modules
```

## 開發技巧

### 熱重載
Vite 支援 HMR（熱模組替換），修改程式碼後會自動更新瀏覽器，無需手動刷新。

### Vue DevTools
建議安裝 Vue DevTools 瀏覽器擴充功能來除錯：
- Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/
- Firefox: https://addons.mozilla.org/firefox/addon/vue-js-devtools/

### 查看狀態管理
使用 Vue DevTools 的 Pinia 標籤可以查看和修改應用狀態：
- `mapStore` - 地圖相關狀態
- `authStore` - 認證相關狀態

## 故障排除

### 開發伺服器無法啟動
```bash
# 清除 node_modules 重新安裝
rm -rf node_modules
bun install
bun run dev
```

### 地圖無法顯示
- 檢查瀏覽器 Console 是否有錯誤
- 確認網路連線（需要載入 OSM 圖磚）
- 清除瀏覽器快取

### 找不到模組錯誤
```bash
# 確認所有依賴已安裝
bun install
```

## 需要幫助？

- 📖 查看 `README.md` - 專案概述
- 📚 查看 `DEVELOPMENT.md` - 詳細開發指南
- 📋 查看 `plan.md` - 完整需求規格

---

祝開發順利！🎉

