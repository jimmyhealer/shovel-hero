import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Array<{
    id: number
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }>>([])
  
  let nextId = 1

  function show(type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    
    // 自動移除 toast
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function success(message: string, duration?: number) {
    show('success', message, duration)
  }

  function error(message: string, duration?: number) {
    show('error', message, duration)
  }

  function info(message: string, duration?: number) {
    show('info', message, duration)
  }

  function warning(message: string, duration?: number) {
    show('warning', message, duration)
  }

  function remove(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    remove
  }
})

