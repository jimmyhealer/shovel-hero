<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapStore } from '../../stores/map'

const emit = defineEmits(['marker-click'])
const mapStore = useMapStore()

const mapContainer = ref(null)
let map = null
let markers = []

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 定義不同類型的圖標顏色
const markerColors = {
  human: '#ef4444', // red
  supply: '#10b981', // green
  'site-holding': '#f59e0b', // amber
  'site-parking': '#8b5cf6', // purple
  'site-stay': '#ec4899', // pink
  'site-food': '#f97316', // orange
}

// 定義不同類型的圖標 SVG
const typeIcons = {
  human: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 2l-4.5 4.5"/><path d="M21 3l-3 3"/></svg>`,
  supply: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5,4.27 12,6.11 16.5,4.27"/><polyline points="7.5,8.73 7.5,12.14"/><polyline points="16.5,8.73 16.5,12.14"/><polyline points="12,13.46 12,9.05"/></svg>`,
  'site-holding': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  'site-parking': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>`,
  'site-stay': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
  'site-food': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
}

// 創建自定義圖標
function createCustomIcon(demand) {
  const { type } = demand
  const color = markerColors[type] || '#6b7280'
  const iconSvg = typeIcons[type] || ''

  // 如果是人力任務，計算還需要的人數
  let content = ''
  if (type === 'human' && demand.humanNeed) {
    const required = demand.humanNeed.required || 0
    const applied = demand.appliedCount || 0
    const remaining = Math.max(0, required - applied)

    content = `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">${remaining}</span>
      </div>
    `
  } else {
    content = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${iconSvg}
      </div>
    `
  }

  return L.divIcon({
    className: 'custom-marker',
    html: content,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

onMounted(() => {
  // 初始化地圖，中心設定在花蓮
  map = L.map(mapContainer.value).setView([23.58, 121.01], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  L.control.zoom({ position: 'topright' }).addTo(map)

  map.on('moveend', () => {
    // TODO: 根據可見範圍載入需求資料
  })

  loadDemands()
})

async function loadDemands() {
  // TODO: 從 Firestore 載入真實資料
  // 這裡先使用模擬資料
  const mockDemands = [
    {
      id: '1',
      type: 'human',
      description: '需要志工協助清理受災區域的淤泥和垃圾',
      location: { lat: 23.5, lng: 121.0, address: '花蓮縣某區某街' },
      contact: { name: '張先生', phone: '0912-345-678' },
      humanNeed: { required: 20, riskNotes: '請穿著防滑鞋，注意地面濕滑' },
      appliedCount: 5,
      status: 'approved'
    },
    {
      id: '2',
      type: 'supply',
      description: '災區急需各種民生物資',
      location: { lat: 23.6, lng: 121.1, address: '花蓮縣某鄉某村' },
      contact: { name: '李小姐', phone: '0923-456-789' },
      supplyItems: [
        { itemName: '飲用水', quantity: 100, unit: '箱' },
        { itemName: '泡麵', quantity: 200, unit: '箱' },
        { itemName: '罐頭食品', quantity: 50, unit: '箱' },
        { itemName: '衛生紙', quantity: 30, unit: '箱' }
      ],
      status: 'approved'
    },
    {
      id: '3',
      type: 'supply',
      description: '學校急需清潔用品',
      location: { lat: 23.55, lng: 121.05, address: '花蓮縣某國小' },
      contact: { name: '王校長', phone: '0934-567-890' },
      supplyItems: [
        { itemName: '漂白水', quantity: 20, unit: '瓶' },
        { itemName: '掃把', quantity: 50, unit: '支' },
        { itemName: '拖把', quantity: 50, unit: '支' },
        { itemName: '垃圾袋', quantity: 100, unit: '包' }
      ],
      status: 'approved'
    }
  ]

  mapStore.setDemands(mockDemands)
  updateMarkers()
}

// 更新地圖標記
function updateMarkers() {
  // 清除舊標記
  markers.forEach(marker => marker.remove())
  markers = []

  // 添加新標記
  mapStore.filteredDemands.forEach(demand => {
    const marker = L.marker(
      [demand.location.lat, demand.location.lng],
      { icon: createCustomIcon(demand) }
    )

    marker.on('click', () => {
      emit('marker-click', demand)
    })

    marker.addTo(map)
    markers.push(marker)
  })
}

// 監聽過濾條件變化
watch(
  () => mapStore.filteredDemands,
  () => {
    updateMarkers()
  },
  { deep: true }
)
</script>

<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<style scoped>
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-container) {
  font-family: inherit;
}
</style>
