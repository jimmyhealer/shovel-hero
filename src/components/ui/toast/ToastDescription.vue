<script setup>
import { reactiveOmit } from "@vueuse/core";
import { ToastDescription } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <ToastDescription
    :class="cn('text-sm opacity-90', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </ToastDescription>
</template>
