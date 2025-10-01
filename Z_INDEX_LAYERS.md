# Z-Index 層級規範

本專案的 z-index 層級規劃，確保 UI 元件正確堆疊顯示。

## 層級定義

### 基礎層（0-99）

- **地圖容器**: `z-0` (預設)
- **地圖標記**: Leaflet 預設層級

### 互動層（100-999）

- **FilterBar（篩選欄）**: `z-[999]`
  - 位置：`src/views/Home.vue`
  - 說明：左側浮動按鈕群組

### 面板層（1000-1999）

- **Dialog Overlay（對話框遮罩層）**: `z-[1000]`
  - 位置：`src/components/ui/dialog/DialogContent.vue`
  - 用途：DemandForm、VolunteerForm、DonationForm、MapPicker 等表單對話框
- **Dialog Content（對話框內容）**: `z-[1001]`
  - 位置：`src/components/ui/dialog/DialogContent.vue`
  - 說明：確保對話框在 FilterBar 之上

- **Select Content（下拉選單內容）**: `z-[1002]`
  - 位置：`src/components/ui/select/SelectContent.vue`
  - 說明：下拉選單必須在 Dialog Content 之上，以便在表單對話框中正常顯示
- **MapPicker 提示文字**: `z-[1000]`
  - 位置：`src/components/Map/MapPicker.vue`
  - 說明：地圖選點對話框內的提示文字，確保在地圖圖層之上

### 側邊面板層（50-99）

- **Drawer Overlay（抽屜遮罩層）**: `z-50`
  - 位置：`src/components/ui/drawer/DrawerOverlay.vue`
  - 用途：DetailPanel 右側詳情面板
- **Drawer Content（抽屜內容）**: `z-50`
  - 位置：`src/components/ui/drawer/DrawerContent.vue`
  - 說明：右側滑入面板，層級低於 Dialog 以避免衝突

### 通知層（9999+）

- **Toast Viewport（通知容器）**: `z-[9999]`
  - 位置：`src/components/ui/toast/ToastViewport.vue`
  - 說明：全域通知訊息，必須在所有其他 UI 元件之上

## 層級順序（由低到高）

```
地圖容器 (z-0)
  ↓
Drawer (z-50) - 右側詳情面板
  ↓
FilterBar (z-999) - 左側篩選按鈕
  ↓
Dialog Overlay (z-1000) - 表單對話框遮罩
  ↓
Dialog Content (z-1001) - 表單對話框內容
  ↓
Select Content (z-1002) - 下拉選單（必須在 Dialog 之上）
  ↓
Toast (z-9999+) - 通知訊息
```

## 設計原則

1. **Dialog 必須在 FilterBar 之上**：確保表單對話框不會被左側按鈕遮擋
2. **Drawer 層級較低**：右側面板不應遮擋對話框
3. **Toast 永遠最高**：通知訊息應該在所有元件之上
4. **避免重疊**：相同類型的元件使用相近的 z-index 值

## 特殊說明

### MapPicker 組件

MapPicker 是一個嵌套在 Dialog 中的地圖選點組件：

- 外層 Dialog 的 z-index 為 1000/1001
- 內部地圖提示文字使用 z-[1000]，確保在 Leaflet 地圖圖層之上
- Leaflet 地圖控制項（縮放按鈕等）預設層級較低，不會影響整體佈局

## 修改記錄

- 2025-10-01: 將 Dialog 的 z-index 從 60 提升至 1000/1001，解決被 FilterBar 遮擋的問題
- 2025-10-01: 新增 MapPicker 組件，實作地圖選點功能
- 2025-10-01: 將 Select Content 的 z-index 從 50 提升至 1002，解決在 Dialog 內無法顯示下拉選單的問題
- 2025-10-01: 將 Toast Viewport 的 z-index 從 100 提升至 9999，確保通知訊息在所有 UI 元件之上
