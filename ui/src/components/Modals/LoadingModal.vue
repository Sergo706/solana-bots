<script setup lang="ts">
import OffensiveSpinner from '../OffensiveSpinner.vue';

const model = defineModel<boolean>({
  default: false
});
</script>

<template>
  <UModal
    v-model:open="model"
    :dismissible="false"
  >
    <template #content>
      <OffensiveSpinner />
    </template>
  </UModal>
</template>
