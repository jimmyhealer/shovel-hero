<template>
  <div vaul-drawer-wrapper class="relative w-full h-screen overflow-hidden">
    <!-- Map Container -->
    <div class="absolute inset-0">
      <MapView @marker-click="handleMarkerClick" />
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
import { useMapStore } from "../stores/map";
import MapView from "../components/Map/MapView.vue";
import DetailPanel from "../components/Map/DetailPanel.vue";
import FilterBar from "../components/Map/FilterBar.vue";

const mapStore = useMapStore();

function handleMarkerClick(demand) {
  mapStore.selectDemand(demand);
}
</script>
