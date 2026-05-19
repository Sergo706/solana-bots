<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script setup lang="ts">
import { ref, computed, nextTick, watch, useTemplateRef } from 'vue';
import type { LogEntry, ScrollAreaExpose } from '@/types/VolumeBots';


const props = defineProps<{
  logs: LogEntry[]
  rawLogs: string[];
}>();

defineEmits(['clear']);

const isRawMode = ref(false);
const filter = ref<'ALL' | 'INFO' | 'BUY' | 'SELL' | 'ERROR' | 'WARN' | 'OUT'>('ALL');
const terminalRef = useTemplateRef<ScrollAreaExpose>('terminalRef');


const normalizedRawLogs = computed<LogEntry[]>(() => {
  return props.rawLogs.map((str) => {
    let guessedLevel: LogEntry['level'] = 'OUT';
    const upperStr = str.toUpperCase();
    
    if (upperStr.includes('BUY')) guessedLevel = 'BUY';
    else if (upperStr.includes('SELL')) guessedLevel = 'SELL';
    else if (upperStr.includes('ERROR') || upperStr.includes('FAIL')) guessedLevel = 'ERROR';
    else if (upperStr.includes('WARN')) guessedLevel = 'WARN';
    else if (upperStr.includes('INFO')) guessedLevel = 'INFO';

    return {
      timestamp: new Date().toLocaleTimeString(),
      level: guessedLevel,
      message: str
    };
  });
});

const filteredLogs = computed(() => {
  const activeSource = isRawMode.value ? normalizedRawLogs.value : props.logs;
  if (filter.value === 'ALL') return activeSource;
  return activeSource.filter(log => log.level === filter.value);
});

const getBadgeColor = (level: LogEntry['level']) => {
  const colors: Record<LogEntry['level'], string> = {
    INFO: 'info',
    BUY: 'success',
    SELL: 'primary',
    ERROR: 'error',
    WARN: 'warning',
    OUT: 'neutral'
  };
  return colors[level] as "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
};


watch(filteredLogs, async () => {
  await nextTick();
  if (terminalRef.value) {
    const el = terminalRef.value.$el;
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
  <UCard 
    :ui="{ 
      body: 'p-0! overflow-hidden', 
      root: 'ring-0 bg-zinc-950 p-0! w-full' 
    }"
    class="w-full overflow-hidden bg-riavzon-900"
  >
    <div class="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 mb-2">
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5">
          <div class="w-3 h-3 rounded-full bg-red-500/80" />
          <div class="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div class="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span class="ml-2 text-xs font-mono text-zinc-400">volume-bot-logs.log</span>
        <!-- DYNAMIC LOG TOGGLE BUTTON -->
        <UButton
          :label="isRawMode ? 'STDOUT (RAW)' : 'PARSED LOGS'"
          :icon="isRawMode ? 'i-lucide-terminal' : 'i-lucide-layers'"
          size="xs"
          variant="subtle"
          :color="isRawMode ? 'warning' : 'info'"
          class="text-[10px] font-mono h-5 py-0 px-2 cursor-pointer uppercase font-bold tracking-wider"
          @click="isRawMode = !isRawMode"
        />
      </div>

      <div class="flex gap-1 overflow-x-auto">
        <UButton 
          label="CLEAR LOGS"
          variant="link" 
          size="xs" 
          color="neutral"
          class="text-[10px] font-mono uppercase cursor-pointer mr-2 underline"
          @click="$emit('clear')"
        />
        <UButton 
          v-for="opt in ['ALL', 'BUY', 'SELL', 'ERROR', 'WARN', 'OUT']" 
          :key="opt"
          :label="opt"
          variant="ghost" 
          size="xs" 
          color="neutral"
          class="text-[10px] font-mono uppercase px-2"
          :class="filter === opt ? 'bg-primary text-white' : 'text-zinc-500'"
          @click="filter = opt as any"
        />
      </div>
    </div>

    <UScrollArea 
      ref="terminalRef"
      class="h-100 w-full"
      :ui="{
        root: 'w-full',
        viewport: 'w-full p-4 font-mono text-xs leading-relaxed scroll-smooth bg-riavzon-900'
      }"
    >
      <div
        v-for="(log, index) in filteredLogs"
        :key="index"
        class="flex gap-3 mb-2 items-center group"
      >
        <span class="text-zinc-600 shrink-0 select-none">{{ log.timestamp }}</span>
        
        <UBadge
          variant="soft"
          size="xs"
          :color="getBadgeColor(log.level)"
          :label="log.level"
          class="shrink-0 px-1 justify-center font-mono text-[10px] tracking-wide"
        />

        <span class="text-zinc-300 group-hover:text-white transition-colors truncate">
          {{ log.message}}
        </span>
      </div>
      
      <div class="flex gap-2  items-center mt-2">
        <span class="text-zinc-600">{{ new Date().toLocaleTimeString() }}</span>
        <span class="text-zinc-400">></span>
        <div class="w-2 h-4 mb-1 bg-primary animate__animated animate__flash animate__infinite	infinite  animate__slow" />
      </div>
    </UScrollArea>
  </UCard>
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