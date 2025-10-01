<script setup>
import { reactiveOmit } from "@vueuse/core";
import { X } from "lucide-vue-next";
import { ToastClose } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <ToastClose
    v-bind="delegatedProps"
    :class="
      cn(
        'absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        props.class,
      )
    "
  >
    <X class="h-4 w-4" />
  </ToastClose>
</template>
