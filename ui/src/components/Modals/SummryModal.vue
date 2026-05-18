<script setup lang="ts">
import type { SellResponseMain } from '@/types/TradesResponse';



defineProps<{
  title: string;
  msg: string;
  sell: SellResponseMain
}>();

const emit = defineEmits(['close']);

const onClick = (): void => {
  emit('close', true);
};

</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :ui="{ overlay: 'bg-elevated/55 backdrop-blur-lg backdrop-saturate-150' }"
    :title="title"
    :description="msg"
  >
    <template #body>
      <TradeResonses :sell="sell" />
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          label="OK"
          @click="onClick"
        />
      </div>
    </template>
  </UModal>
</template>
