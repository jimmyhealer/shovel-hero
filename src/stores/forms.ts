// 對齊 SRS：表單草稿管理（plan.md 7.2, 7.3）
// 使用 Pinia + persist 取代 localStorage 直接操作
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface VolunteerFormData {
  name: string
  phone: string
  availableTime: string
  skills: string
  tools: string
  note: string
}

interface DonationFormData {
  name: string
  phone: string
  itemName: string
  quantity: string
  unit: string
  eta: string
  note: string
}

export const useVolunteerFormStore = defineStore('volunteer-form', () => {
  const formData = ref<VolunteerFormData>({
    name: '',
    phone: '',
    availableTime: '',
    skills: '',
    tools: '',
    note: ''
  })

  function updateField(field: keyof VolunteerFormData, value: string) {
    formData.value[field] = value
  }

  function reset() {
    formData.value = {
      name: '',
      phone: '',
      availableTime: '',
      skills: '',
      tools: '',
      note: ''
    }
  }

  return {
    formData,
    updateField,
    reset
  }
}, {
  persist: true
})

export const useDonationFormStore = defineStore('donation-form', () => {
  const formData = ref<DonationFormData>({
    name: '',
    phone: '',
    itemName: '',
    quantity: '',
    unit: '',
    eta: '',
    note: ''
  })

  function updateField(field: keyof DonationFormData, value: string) {
    formData.value[field] = value
  }

  function reset() {
    formData.value = {
      name: '',
      phone: '',
      itemName: '',
      quantity: '',
      unit: '',
      eta: '',
      note: ''
    }
  }

  return {
    formData,
    updateField,
    reset
  }
}, {
  persist: true
})

