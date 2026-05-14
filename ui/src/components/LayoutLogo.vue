<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const logo = new URL('../assets/public/solana-bots.webp', import.meta.url).href;

defineProps({
  isText: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <RouterLink
    to="/"
    aria-label="Go back to home page"
  >
    <UUser
      :name=" isText ? 'Solana Bots' : ''"
      :avatar="{
        src: logo
      }"
      size="2xl"
    />
  </RouterLink>
</template>