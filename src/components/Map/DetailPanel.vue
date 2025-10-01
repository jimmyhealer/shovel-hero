<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <h2 class="text-xl font-semibold text-gray-900">需求詳情</h2>
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="關閉"
      >
        <XIcon class="w-5 h-5 text-gray-500" />
      </button>
    </div>

    <!-- Content -->
    <div v-if="selectedDemand" class="flex-1 overflow-y-auto">
      <!-- Type Badge -->
      <div class="p-4 border-b">
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="getTypeBadgeClass(selectedDemand.type)"
        >
          {{ getTypeLabel(selectedDemand.type) }}
        </span>
      </div>

      <!-- Title -->
      <div class="p-4 border-b">
        <h3 class="text-2xl font-bold text-gray-900">
          {{ selectedDemand.title }}
        </h3>
      </div>

      <!-- Location -->
      <div class="p-4 border-b">
        <div class="flex items-start gap-3">
          <MapPinIcon class="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-gray-900">集合地點</p>
            <p class="text-sm text-gray-600 mt-1">
              {{ selectedDemand.location?.address || '未提供' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div v-if="selectedDemand.contact" class="p-4 border-b">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <UserIcon class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">聯絡人</p>
              <p class="text-sm text-gray-600">{{ selectedDemand.contact.name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <PhoneIcon class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">聯絡電話</p>
              <p class="text-sm text-gray-600">{{ selectedDemand.contact.phone }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="selectedDemand.description" class="p-4 border-b">
        <h4 class="text-sm font-medium text-gray-900 mb-2">詳細說明</h4>
        <p class="text-sm text-gray-600 whitespace-pre-wrap">
          {{ selectedDemand.description }}
        </p>
      </div>

      <!-- Human Need Info -->
      <div v-if="selectedDemand.type === 'human' && selectedDemand.humanNeed" class="p-4 border-b">
        <div class="space-y-3">
          <div>
            <p class="text-sm font-medium text-gray-900">所需人數</p>
            <p class="text-sm text-gray-600">{{ selectedDemand.humanNeed.required }} 人</p>
          </div>
          <div v-if="selectedDemand.humanNeed.riskNotes">
            <p class="text-sm font-medium text-red-600">⚠️ 風險注意事項</p>
            <p class="text-sm text-red-600 mt-1">{{ selectedDemand.humanNeed.riskNotes }}</p>
          </div>
        </div>
      </div>

      <!-- Supply Need Info -->
      <div v-if="selectedDemand.type === 'supply' && selectedDemand.supplyNeed" class="p-4 border-b">
        <div class="space-y-2">
          <div>
            <p class="text-sm font-medium text-gray-900">所需物資</p>
            <p class="text-sm text-gray-600">{{ selectedDemand.supplyNeed.itemName }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">所需數量</p>
            <p class="text-sm text-gray-600">
              {{ selectedDemand.supplyNeed.quantity }} {{ selectedDemand.supplyNeed.unit }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="p-4 space-y-3">
        <button
          v-if="selectedDemand.type === 'human'"
          class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          我要報名志工
        </button>
        <button
          v-if="selectedDemand.type === 'supply'"
          class="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          我要捐贈物資
        </button>
        <button
          class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          分享此需求
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center p-8">
      <p class="text-gray-500">請選擇地圖上的標記以查看詳情</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '../../stores/map'
import { 
  XIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon 
} from 'lucide-vue-next'

defineEmits(['close'])

const mapStore = useMapStore()
const selectedDemand = computed(() => mapStore.selectedDemand)

const typeLabels = {
  human: '人力任務',
  supply: '物資需求',
  'site-holding': '污泥暫置場',
  'site-parking': '物資停放處',
  'site-stay': '住宿地點',
  'site-food': '領吃食區域'
}

function getTypeLabel(type) {
  return typeLabels[type] || type
}

function getTypeBadgeClass(type) {
  const classes = {
    human: 'bg-blue-100 text-blue-800',
    supply: 'bg-green-100 text-green-800',
    'site-holding': 'bg-amber-100 text-amber-800',
    'site-parking': 'bg-purple-100 text-purple-800',
    'site-stay': 'bg-pink-100 text-pink-800',
    'site-food': 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}
</script>

