import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)

  // Computed
  const userRole = computed(() => {
    if (!user.value) return null
    return user.value.role || 'visitor'
  })

  // Actions
  function setUser(userData) {
    user.value = userData
    isAuthenticated.value = !!userData
    isAdmin.value = userData?.role === 'admin' || userData?.role === 'staff'
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    isAdmin.value = false
  }

  // TODO: Implement Firebase auth integration
  async function loginWithGoogle() {
    console.log('Login with Google - to be implemented')
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    userRole,
    setUser,
    logout,
    loginWithGoogle
  }
})

