<script setup>
import { ref } from 'vue'
import { useMapStore } from '../../stores/map'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Users, 
  Package, 
  Construction, 
  ParkingCircle, 
  Home, 
  Utensils 
} from 'lucide-vue-next'

const mapStore = useMapStore()

const localFilters = ref({
  type: null,
  status: 'approved',
  region: null
})

const filterTypes = [
  { value: null, label: '全部類型', icon: Globe },
  { value: 'human', label: '人力任務', icon: Users },
  { value: 'supply', label: '物資需求', icon: Package },
  { value: 'site-holding', label: '污泥暫置場', icon: Construction },
  { value: 'site-parking', label: '物資停放處', icon: ParkingCircle },
  { value: 'site-stay', label: '住宿地點', icon: Home },
  { value: 'site-food', label: '領吃食區域', icon: Utensils },
]

function selectType(type) {
  localFilters.value.type = type
  mapStore.updateFilters(localFilters.value)
}
</script>

<template>
  <div class="rounded-lg max-w-[120px]">
    <!-- Type Filter Buttons -->
    <div class="space-y-1">
      <Button
        v-for="type in filterTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :variant="localFilters.type === type.value ? 'default' : 'secondary'"
        :class="[
          'w-full justify-start gap-3 text-white backdrop-blur-sm',
          localFilters.type === type.value 
            ? 'bg-gray-600/80 shadow-lg hover:bg-gray-600/90' 
            : 'bg-gray-600/60 hover:bg-gray-600/70'
        ]"
      >
        <component :is="type.icon" :size="20" class="flex-shrink-0" />
        <span class="flex-1 text-left">{{ type.label }}</span>
      </Button>
    </div>
  </div>
</template>

