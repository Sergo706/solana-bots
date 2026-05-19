<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { Stats } from '@/types/VolumeBots';
import { computed } from 'vue';
import { capitalize } from '@riavzon/utils';
const props = defineProps<{stats: Omit<Stats, 'lastRun'>}>();

const statuses = computed(() => [
  {
    title: 'Status',
    icon: props.stats.status === 'running' ? 'i-lucide-activity' : 'i-lucide-circle-stop',
    value: capitalize(props.stats.status),
  }, 
  {
    title: 'Target',
    icon: 'i-lucide-crosshair',
    value: `${props.stats.target.slice(0, 4)}...${props.stats.target.slice(-8)}`,
  }, 
  {
    title: 'Current Action',
    icon: props.stats.currentAction === 'buy' ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-left',
    value: capitalize(props.stats.currentAction),
  }, 
  {
    title: 'P&L',
    icon: props.stats.pl >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down',
    value: props.stats.pl.toFixed(4),
  }
]);

const stats = computed(() => [
  {
    title: 'Cycle Runs',
    icon: 'i-lucide-repeat',
    value: props.stats.cycleRuns,
  }, 
  {
    title: 'Total Buys',
    icon: 'i-lucide-shopping-cart',
    value: props.stats.totalBuys,
  }, 
  {
    title: 'Total Sells',
    icon: 'i-lucide-hand-coins',
    value: props.stats.totalSells,
  },
  {
    title: 'Errors count',
    icon: 'i-lucide-alert-triangle',
    value: props.stats.errors,
  }
]);
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in statuses"
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

  <USeparator />
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