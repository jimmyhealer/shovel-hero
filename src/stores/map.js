import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMapStore = defineStore('map', () => {
  // State
  const selectedDemand = ref(null)
  const isPanelOpen = ref(false)
  const demands = ref([])
  const filters = ref({
    type: null,
    status: 'approved',
    region: null
  })

  // Computed
  const filteredDemands = computed(() => {
    return demands.value.filter(demand => {
      if (filters.value.status && demand.status !== filters.value.status) {
        return false
      }
      if (filters.value.type && demand.type !== filters.value.type) {
        return false
      }
      if (filters.value.region && demand.region !== filters.value.region) {
        return false
      }
      return true
    })
  })

  // Actions
  function selectDemand(demand) {
    selectedDemand.value = demand
    isPanelOpen.value = true
  }

  function closePanel() {
    isPanelOpen.value = false
    selectedDemand.value = null
  }

  function setDemands(newDemands) {
    demands.value = newDemands
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    selectedDemand,
    isPanelOpen,
    demands,
    filters,
    filteredDemands,
    selectDemand,
    closePanel,
    setDemands,
    updateFilters
  }
})

