<template>
  <div id="app" class="min-h-screen bg-background text-foreground">
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // TODO: Initialize Firebase auth listener
  // This will check if user is already logged in
  console.log('App initialized')
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
