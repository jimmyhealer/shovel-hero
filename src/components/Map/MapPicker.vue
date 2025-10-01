<script setup>
// 對齊 SRS：地圖選點功能
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon, SearchIcon } from "lucide-vue-next";

const props = defineProps({
  open: Boolean,
  initialLocation: {
    type: Object,
    default: () => ({
      lat: 23.58,
      lng: 121.01,
      address: "",
    }),
  },
});

const emit = defineEmits(["update:open", "select"]);

const mapContainer = ref(null);
let map = null;
let marker = null;

const selectedLocation = ref({
  lat: props.initialLocation.lat || 23.58,
  lng: props.initialLocation.lng || 121.01,
  address: props.initialLocation.address || "",
});

const searchQuery = ref("");
const isSearching = ref(false);

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 自定義選點標記圖標
const pickIcon = L.divIcon({
  className: "custom-pick-marker",
  html: `
    <div style="
      background-color: #3b82f6;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      border: 4px solid white;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg)">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// 初始化地圖
function initMap() {
  if (!mapContainer.value || map) return;

  // 創建地圖
  map = L.map(mapContainer.value, {
    zoomControl: true,
  }).setView([selectedLocation.value.lat, selectedLocation.value.lng], 13);

  // 添加圖層
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // 添加初始標記
  updateMarker(selectedLocation.value.lat, selectedLocation.value.lng);

  // 點擊地圖選點
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    selectedLocation.value.lat = lat;
    selectedLocation.value.lng = lng;
    updateMarker(lat, lng);
    reverseGeocode(lat, lng);
  });
}

// 更新標記位置
function updateMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { icon: pickIcon }).addTo(map);
  }
  map.panTo([lat, lng]);
}

// 反向地理編碼（經緯度轉地址）
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-TW`,
    );
    const data = await response.json();
    if (data.display_name) {
      selectedLocation.value.address = data.display_name;
    }
  } catch (err) {
    console.error("反向地理編碼失敗:", err);
  }
}

// 地址搜尋
async function searchAddress() {
  if (!searchQuery.value.trim()) return;

  isSearching.value = true;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=1&accept-language=zh-TW`,
    );
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      selectedLocation.value = {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        address: display_name,
      };
      updateMarker(selectedLocation.value.lat, selectedLocation.value.lng);
      map.setView([selectedLocation.value.lat, selectedLocation.value.lng], 15);
    } else {
      alert("找不到該地址，請嘗試其他關鍵字");
    }
  } catch (err) {
    console.error("地址搜尋失敗:", err);
    alert("搜尋失敗，請稍後再試");
  } finally {
    isSearching.value = false;
  }
}

// 確認選點
function confirmSelection() {
  emit("select", {
    lat: selectedLocation.value.lat,
    lng: selectedLocation.value.lng,
    address: selectedLocation.value.address,
  });
  emit("update:open", false);
}

// 使用目前位置
function useCurrentLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        selectedLocation.value.lat = latitude;
        selectedLocation.value.lng = longitude;
        updateMarker(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("無法取得位置:", error);
        alert("無法取得您的位置，請確認已授權位置存取");
      },
    );
  } else {
    alert("您的瀏覽器不支援定位功能");
  }
}

// 監聽對話框開啟狀態
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      // 延遲初始化地圖，確保 DOM 已渲染
      setTimeout(() => {
        initMap();
        // 如果有初始位置，更新地圖視圖
        if (props.initialLocation.lat && props.initialLocation.lng) {
          selectedLocation.value = { ...props.initialLocation };
          if (map) {
            map.setView(
              [selectedLocation.value.lat, selectedLocation.value.lng],
              13,
            );
            updateMarker(
              selectedLocation.value.lat,
              selectedLocation.value.lng,
            );
          }
        }
      }, 100);
    } else {
      // 清理地圖
      if (map) {
        map.remove();
        map = null;
        marker = null;
      }
    }
  },
);

// 組件卸載時清理
onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle class="flex items-center gap-2">
          <MapPinIcon class="w-5 h-5" />
          從地圖選擇地點
        </DialogTitle>
        <DialogDescription>
          點擊地圖上的任意位置選擇地點，或使用搜尋功能找到特定地址
        </DialogDescription>
      </DialogHeader>

      <!-- 搜尋欄 -->
      <div class="px-6 pb-4">
        <div class="flex gap-2">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="搜尋地址，例：台南市安南區..."
              @keyup.enter="searchAddress"
            />
          </div>
          <Button
            type="button"
            @click="searchAddress"
            :disabled="isSearching || !searchQuery.trim()"
          >
            <SearchIcon class="w-4 h-4 mr-2" />
            搜尋
          </Button>
          <Button type="button" variant="outline" @click="useCurrentLocation">
            使用目前位置
          </Button>
        </div>
      </div>

      <!-- 地圖容器 -->
      <div class="flex-1 relative border-y">
        <div ref="mapContainer" class="w-full h-full"></div>

        <!-- 提示文字 -->
        <div
          class="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-[1000] pointer-events-none"
        >
          <p class="text-sm text-gray-700 font-medium">點擊地圖選擇地點</p>
        </div>
      </div>

      <!-- 選中的位置資訊 -->
      <div class="px-6 py-4 bg-gray-50 border-t">
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <Label class="text-sm font-medium text-gray-700 min-w-[60px] pt-1"
              >地址：</Label
            >
            <p class="text-sm text-gray-900 flex-1">
              {{ selectedLocation.address || "請點擊地圖選擇位置" }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <Label class="text-gray-700 min-w-[60px]">緯度：</Label>
              <span class="text-gray-900 font-mono">{{
                selectedLocation.lat.toFixed(6)
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Label class="text-gray-700 min-w-[60px]">經度：</Label>
              <span class="text-gray-900 font-mono">{{
                selectedLocation.lng.toFixed(6)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="px-6 pb-6">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
        >
          取消
        </Button>
        <Button
          type="button"
          @click="confirmSelection"
          :disabled="!selectedLocation.address"
        >
          確認選擇
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
:deep(.custom-pick-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-container) {
  font-family: inherit;
  cursor: crosshair;
}

:deep(.leaflet-control-zoom) {
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:deep(.leaflet-bar a) {
  background-color: white;
  color: #374151;
}

:deep(.leaflet-bar a:hover) {
  background-color: #f3f4f6;
}
</style>
