<script setup>
import { useForwardPropsEmits } from "reka-ui";
import { DrawerRoot } from "vaul-vue";
import { provide } from "vue";

const props = defineProps({
  activeSnapPoint: { type: [Number, String, null], required: false },
  closeThreshold: { type: Number, required: false },
  shouldScaleBackground: { type: Boolean, required: false, default: true },
  setBackgroundColorOnScale: { type: Boolean, required: false },
  scrollLockTimeout: { type: Number, required: false },
  fixed: { type: Boolean, required: false },
  dismissible: { type: Boolean, required: false },
  modal: { type: Boolean, required: false },
  open: { type: Boolean, required: false },
  defaultOpen: { type: Boolean, required: false },
  nested: { type: Boolean, required: false },
  direction: { type: String, required: false },
  noBodyStyles: { type: Boolean, required: false },
  handleOnly: { type: Boolean, required: false },
  preventScrollRestoration: { type: Boolean, required: false },
  snapPoints: { type: Array, required: false },
  fadeFromIndex: { type: null, required: false },
});

const emits = defineEmits([
  "drag",
  "release",
  "close",
  "update:open",
  "update:activeSnapPoint",
  "animationEnd",
]);

const forwarded = useForwardPropsEmits(props, emits);

// 提供 direction 給子組件
provide('drawerDirection', props.direction || 'bottom');
</script>

<template>
  <DrawerRoot v-bind="forwarded">
    <slot />
  </DrawerRoot>
</template>
