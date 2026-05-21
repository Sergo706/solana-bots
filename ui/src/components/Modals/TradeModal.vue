<script setup lang="ts">

defineProps<{
  title: string;
  msg: string;
  btnLabel?: string;
  btnColor?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  btnIcon?: string
  btnSize?: "xs" | "sm" | "md" | "lg" | "xl"
  showBtn: boolean
}>();

const model = defineModel<boolean>({
  default: false
});

const emit = defineEmits<(e: 'close', value: boolean) => void>();
</script>

<template>
  <UModal
    v-model:open="model"
    :title="title"
    :description="msg"
    :close="{
      onClick: () => emit('close', false),
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
  > 
    <UButton
      v-if="showBtn"
      :label="btnLabel ?? 'open'"
      variant="subtle"
      class="cursor-pointer"
      :color="btnColor ?? 'primary'"
      :size="btnSize ?? 'md'"
      :trailing-icon="btnIcon ?? 'i-lucide-play'"
    />
    <template #body>
      <slot name="contentModal" />
    </template>
  </UModal>
</template>
