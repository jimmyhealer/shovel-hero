<template>
  <div vaul-drawer-wrapper class="relative w-full h-screen overflow-hidden">
    <!-- Map Container -->
    <div class="absolute inset-0">
      <MapView @marker-click="handleMarkerClick" />
    </div>

    <!-- Header Title -->
    <div class="absolute top-6 left-1/2 -translate-x-1/2 z-[999] text-center">
      <div class="flex items-center justify-center gap-3 mb-2">
        <Shovel class="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" :stroke-width="2.5" />
        <h1 class="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          鏟子英雄 2.0
        </h1>
      </div>
      <div class="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-50 border border-red-200 rounded-lg shadow-lg">
        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <p class="text-xs font-medium text-red-700">
          測試版本 · 資料僅供展示使用
        </p>
      </div>
    </div>

    <!-- Detail Panel (Drawer) -->
    <DetailPanel />

    <!-- Filters Bar -->
    <div class="absolute top-1/2 -translate-y-1/2 left-4 z-[999]">
      <FilterBar />
    </div>
  </div>
</template>

<script setup>
import { Shovel } from "lucide-vue-next";
import { useMapStore } from "../stores/map";
import MapView from "../components/Map/MapView.vue";
import DetailPanel from "../components/Map/DetailPanel.vue";
import FilterBar from "../components/Map/FilterBar.vue";

const mapStore = useMapStore();

function handleMarkerClick(demand) {
  mapStore.selectDemand(demand);
}
</script>
