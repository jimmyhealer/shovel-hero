<script setup>
import { reactiveOmit } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import { DrawerContent, DrawerPortal } from "vaul-vue";
import { cn } from "@/lib/utils";
import DrawerOverlay from "./DrawerOverlay.vue";
import { inject, computed } from "vue";

const props = defineProps({
  forceMount: { type: Boolean, required: false },
  disableOutsidePointerEvents: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});
const emits = defineEmits([
  "escapeKeyDown",
  "pointerDownOutside",
  "focusOutside",
  "interactOutside",
  "openAutoFocus",
  "closeAutoFocus",
]);

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardPropsEmits(delegatedProps, emits);

// 從父組件 Drawer 獲取 direction
const direction = inject('drawerDirection', 'bottom');
const showHandle = computed(() => direction !== 'right');
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      v-bind="forwardedProps"
      :class="
        cn(
          'fixed z-50 mt-24 flex border bg-background',
          'inset-y-0 top-0 right-0 h-full w-[90vw] sm:w-[500px] rounded-l-[10px] flex-col',
          props.class,
        )
      "
    >
      <div v-if="showHandle" class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
