<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- Map Container -->
    <div 
      class="absolute inset-0 transition-all duration-300"
      :class="isPanelOpen ? 'md:right-[480px]' : 'right-0'"
    >
      <MapView @marker-click="handleMarkerClick" />
    </div>

    <!-- Detail Panel -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div 
        v-if="isPanelOpen"
        class="absolute top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-10 overflow-y-auto"
      >
        <DetailPanel @close="closePanel" />
      </div>
    </Transition>

    <!-- Filters Bar -->
    <div class="absolute top-1/2 -translate-y-1/2 left-4 z-[500]">
      <FilterBar />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '../stores/map'
import MapView from '../components/Map/MapView.vue'
import DetailPanel from '../components/Map/DetailPanel.vue'
import FilterBar from '../components/Map/FilterBar.vue'

const mapStore = useMapStore()
const isPanelOpen = computed(() => mapStore.isPanelOpen)

function handleMarkerClick(demand) {
  mapStore.selectDemand(demand)
}

function closePanel() {
  mapStore.closePanel()
}
</script>

