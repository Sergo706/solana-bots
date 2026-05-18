<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">

const props = defineProps<{
    totalSubWallets: number;
    openPositions: number;
    totalSolInSubs: number;
    solInMainWallet: number;
}>();

const stats = [{
  title: 'total Sub Wallets',
  icon: 'i-lucide-users',
  value: props.totalSubWallets,
}, {
  title: 'open Positions',
  icon: 'i-lucide-activity',
  value: props.openPositions,
}, {
  title: 'total Sol In wallets',
  icon: 'i-lucide-circle-dollar-sign',
  value: props.totalSolInSubs,
}, {
  title: 'total Sol in main',
  icon: 'i-lucide-wallet',
  value: props.solInMainWallet,
}];

</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>