<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

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
  human: '#3b82f6', // blue
  supply: '#10b981', // green
  'site-holding': '#f59e0b', // amber
  'site-parking': '#8b5cf6', // purple
  'site-stay': '#ec4899', // pink
  'site-food': '#f97316', // orange
}

// 創建自定義圖標
function createCustomIcon(type) {
  const color = markerColors[type] || '#6b7280'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

onMounted(() => {
  // 初始化地圖，中心設定在花蓮
  map = L.map(mapContainer.value).setView([23.58, 121.01], 10)

  // 添加 OpenStreetMap 圖層
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  // 添加縮放控制
  L.control.zoom({ position: 'topright' }).addTo(map)

  // 監聽地圖的縮放和移動
  map.on('moveend', () => {
    // TODO: 根據可見範圍載入需求資料
  })

  // 載入初始資料
  loadDemands()
})

// 載入需求資料
async function loadDemands() {
  // TODO: 從 Firestore 載入真實資料
  // 這裡先使用模擬資料
  const mockDemands = [
    {
      id: '1',
      type: 'human',
      title: '清理淹水區域',
      location: { lat: 23.5, lng: 121.0, address: '台灣某地' },
      status: 'approved'
    },
    {
      id: '2',
      type: 'supply',
      title: '急需飲用水',
      location: { lat: 23.6, lng: 121.1, address: '台灣某地' },
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
      { icon: createCustomIcon(demand.type) }
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

<style scoped>
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-container) {
  font-family: inherit;
}
</style>

