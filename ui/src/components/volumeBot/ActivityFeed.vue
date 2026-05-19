<script setup lang="ts">
import type { Activity, ScrollAreaExpose } from '@/types/VolumeBots';
import { useTemplateRef, watch, nextTick, ref } from 'vue';


const props = defineProps<{activities: Activity[]}>();
const activities = ref(props.activities);
const activityRef = useTemplateRef<ScrollAreaExpose>('activity');

watch(activities, async () => {
  await nextTick();
  if (activityRef.value) {
    const el = activityRef.value.$el;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth'
    });
  }
}, { deep: true });
</script>

<template>
  <div
    v-if="activities && activities.length > 0"
    class="flex flex-col gap-3 w-full"
  >
    <div class="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
      <UIcon
        name="i-lucide-zap"
        class="text-primary animate-pulse"
      />
      <span>Live Activity Feed</span>
    </div>
      
    <UScrollArea 
      v-slot="{ item: act }"
      ref="activity"
      :items="activities"
      :virtualize="{
        gap: 12,
        paddingEnd: 12,
        paddingStart: 12,
        estimateSize: 500
      }"
      class="h-150 w-full whitespace-nowrap border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 rounded-xl"
      :ui="{ 
        viewport: 'leading-relaxed scroll-smooth bg-riavzon-900',
        item: 'px-3' 
      }"
    >
      <div 
        class="shrink-0 px-3 py-1.5 rounded-lg border backdrop-blur-sm flex items-center gap-3 transition-all hover:border-zinc-400 dark:hover:border-zinc-700  bg-white dark:bg-zinc-900/50"
        :class="act.status === 'error' ? 'border-error/40 ring-1 ring-error/10' : 'border-zinc-200 dark:border-zinc-800'"
      >
        <div class="flex flex-col justify-center">
          <span class="text-[9px] font-mono text-zinc-500 leading-none mb-0.5">{{ act.time }}</span>
          <span class="text-xs font-bold text-neutral/50">{{ act.wallet }}</span>
        </div>

        <USeparator
          orientation="vertical"
          class="h-6 w-px bg-zinc-850"
        />

        <div class="flex items-center gap-2">
          <UBadge
            :variant="act.status === 'error' ? 'outline' : 'soft'"
            size="xs"
            :color="act.action === 'Buy' ? 'success' : 'error'"
            class="font-mono font-bold uppercase text-[10px] px-1.5 py-0.5"
          >
            <template #leading>
              <UIcon 
                :name="act.action === 'Buy' ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-left'" 
                class="size-3"
              />
            </template>
            {{ act.action }}
          </UBadge>
          
          <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-100 font-mono">
            {{ act.amount }}
          </span>
        </div>
        <UBadge
          :variant="act.status === 'error' ? 'outline' : 'soft'"
          size="xs"
          :label="act.status"
          :color="act.status === 'success' ? 'success' : 'error'"
          class="font-mono font-bold uppercase text-[10px] px-1.5 py-0.5 ml-auto"
        />
      </div>
    </UScrollArea>
  </div>

  <UEmpty 
    v-if="!activities || activities.length === 0"
    class="flex-1 min-h-[550px] grid place-content-center text-center"
    icon="i-lucide-activity"
    title="No activities yet" 
    description="Configure the bot see events"
    :ui="{root: 'ring-0'}"
  />
</template>
<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
</style>