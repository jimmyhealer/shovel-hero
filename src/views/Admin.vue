<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">管理後台</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">待審核項目</h2>
        <p class="text-gray-600">管理後台功能開發中...</p>
        
        <!-- TODO: Implement admin features -->
        <div class="mt-6 space-y-4">
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900">待實作功能：</h3>
            <ul class="mt-2 space-y-2 text-sm text-gray-600">
              <li>• 需求審核列表（人力需求、物資需求）</li>
              <li>• 志工報名審核</li>
              <li>• 物資捐贈審核</li>
              <li>• 審核紀錄查詢</li>
              <li>• 資料匯出功能</li>
              <li>• 操作稽核日誌</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

