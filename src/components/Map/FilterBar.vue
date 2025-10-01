<template>
  <div class="bg-gray-700/95 rounded-lg shadow-xl p-2 min-w-[180px] backdrop-blur-sm">
    <!-- Type Filter Buttons -->
    <div class="space-y-1">
      <button
        v-for="type in filterTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white text-sm transition-all',
          localFilters.type === type.value 
            ? 'bg-gray-600/80 shadow-lg' 
            : 'bg-gray-600/60 hover:bg-gray-600/70'
        ]"
      >
        <span class="text-2xl">{{ type.icon }}</span>
        <span class="flex-1 text-left">{{ type.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMapStore } from '../../stores/map'

const mapStore = useMapStore()

const localFilters = ref({
  type: null,
  status: 'approved',
  region: null
})

const filterTypes = [
  { value: null, label: '全部類型', icon: '🌍' },
  { value: 'human', label: '人力任務', icon: '👥' },
  { value: 'supply', label: '物資需求', icon: '📦' },
  { value: 'site-holding', label: '污泥暫置場', icon: '🏗️' },
  { value: 'site-parking', label: '物資停放處', icon: '🅿️' },
  { value: 'site-stay', label: '住宿地點', icon: '🏠' },
  { value: 'site-food', label: '領吃食區域', icon: '🍽️' },
]

function selectType(type) {
  localFilters.value.type = type
  mapStore.updateFilters(localFilters.value)
}
</script>

