<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: [String, Number]
})

const emit = defineEmits(['update:modelValue'])

// 從 $attrs 中排除 class，因為我們手動處理它
defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <input v-bind="$attrs" :value="modelValue" :class="cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    $attrs.class
  )" @input="emit('update:modelValue', $event.target.value)" />
</template>
