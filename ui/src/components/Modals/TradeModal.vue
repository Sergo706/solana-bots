<script setup lang="ts">
import {ref } from 'vue';
const props = defineProps<{
  title: string;
  msg: string;
  btnLabel: string;
  btnColor: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  btnIcon: string
  btnSize: "xs" | "sm" | "md" | "lg" | "xl"
  open?: boolean
}>();

const open = ref<boolean>(props.open);
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="msg"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
  > 
    <UButton
      :label="btnLabel"
      variant="subtle"
      class="cursor-pointer"
      :color="btnColor"
      :size="btnSize"
      :trailing-icon="btnIcon"
    />
    <template #body>
      <slot name="contentModal" />
    </template>
  </UModal>
</template>
