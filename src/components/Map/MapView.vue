<script setup>
import { ref, onMounted, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "../../stores/map";
import { mockDemands } from "../../mockData";

const emit = defineEmits(["marker-click"]);
const mapStore = useMapStore();

const mapContainer = ref(null);
let map = null;
let markers = [];

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 定義不同類型的圖標顏色
const markerColors = {
  human: "#ef4444", // red
  supply: "#10b981", // green
  "site-holding": "#f59e0b", // amber
  "site-parking": "#8b5cf6", // purple
  "site-stay": "#ec4899", // pink
  "site-food": "#f97316", // orange
};

// 定義不同類型的圖標 SVG
const typeIcons = {
  supply: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-icon lucide-package"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>`,
  "site-holding": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-construction-icon lucide-construction"><rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/></svg>`,
  "site-parking": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-parking-icon lucide-circle-parking"><circle cx="12" cy="12" r="10"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  "site-stay": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  "site-food": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils-icon lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
};

// 創建自定義圖標
function createCustomIcon(demand) {
  const { type } = demand;
  const color = markerColors[type] || "#6b7280";
  const iconSvg = typeIcons[type] || "";

  // 如果是人力任務，計算還需要的人數
  let content = "";
  if (type === "human" && demand.humanNeed) {
    const required = demand.humanNeed.required || 0;
    const applied = demand.appliedCount || 0;
    const remaining = Math.max(0, required - applied);

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
    `;
  } else {
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
        <div style="transform: rotate(45deg);">
          ${iconSvg}
        </div>
      </div>
    `;
  }

  return L.divIcon({
    className: "custom-marker",
    html: content,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

onMounted(() => {
  // 初始化地圖，中心設定在花蓮
  map = L.map(mapContainer.value).setView([23.58, 121.01], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  map.on("moveend", () => {
    // TODO: 根據可見範圍載入需求資料
  });

  loadDemands();
});

async function loadDemands() {
  mapStore.setDemands(mockDemands);
  updateMarkers();
}

// 更新地圖標記
function updateMarkers() {
  // 清除舊標記
  markers.forEach((marker) => marker.remove());
  markers = [];

  // 添加新標記
  mapStore.filteredDemands.forEach((demand) => {
    const marker = L.marker([demand.location.lat, demand.location.lng], {
      icon: createCustomIcon(demand),
    });

    marker.on("click", () => {
      emit("marker-click", demand);
    });

    marker.addTo(map);
    markers.push(marker);
  });
}

// 監聽過濾條件變化
watch(
  () => mapStore.filteredDemands,
  () => {
    updateMarkers();
  },
  { deep: true },
);
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
