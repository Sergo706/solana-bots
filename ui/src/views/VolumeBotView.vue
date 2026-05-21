<script setup lang="ts">
import ActivityFeed from '@/components/volumeBot/ActivityFeed.vue';
import Logs from '@/components/volumeBot/Logs.vue';
import Stats from '@/components/volumeBot/Stats.vue';
import Layout from '@/Layout.vue';
import { dtFmtWithSeconds } from '@/utils/date';
import { ref, onBeforeUnmount, onMounted, computed, watch } from 'vue';
import { useTimer } from '@/composables/useTimer';
import { useVolumeBotEvents } from '@/composables/useVolumeBotEvents';
import { useStaticVolumeStats } from '@/composables/useStaticVolumeStats';
import type {Stats as VolStats} from '@/types/VolumeBots';
import { useVolumeBots } from '@/composables/useVolumeBot';

const { 
  startEvents,
  unBind,
  activity,
  logs,
  stats,
  statsForComponent,
  status,
  rawLogs
 } = useVolumeBotEvents();
 const { stopVolumeBot, loadingStop } = useVolumeBots();

 const { stats: staticStats, getAll } = useStaticVolumeStats();
 
const displayStats = computed<Omit<VolStats, 'lastRun'>>(() => {
  if (statsForComponent.value) return statsForComponent.value;
  console.log(staticStats.value);
  if (staticStats.value) return staticStats.value;
  
  return {
    cycleRuns: 0,
    totalBuys: 0,
    totalSells: 0,
    errors: 0,
    status: 'stopped', 
    target: '',
    currentAction: 'idle',
    pl: 0
  };
});
  
const isRunning = computed(() => status.value?.status === 'running');

const startedAtLabel = computed<string>(() => {
  const start = status.value?.startedAt;
  if (!start) return 'Not Started';
  try {
    return dtFmtWithSeconds.value.format(new Date(start));
  } catch {
    return 'Invalid Date';
  }
});

const stoppedAtLabel = computed<string>(() => {
  const stop = status.value?.stoppedAt;
  const targetDate = stop ? new Date(stop) : new Date();
  try {
    return dtFmtWithSeconds.value.format(targetDate);
  } catch {
    return dtFmtWithSeconds.value.format(new Date());
  }
});

const hasExpiration = computed<boolean>(() => {
  const expiredAt = status.value?.expiredAt;
  if (!expiredAt || expiredAt === Infinity) return false;
  return !isNaN(new Date(expiredAt).getTime());
});

const ttl = computed<number>(() => {
  const expiredAt = status.value?.expiredAt;
  if (!expiredAt || expiredAt === Infinity) return 0;
  
  const expirationTime = new Date(expiredAt).getTime();
  const now = Date.now();
  
  const diff = expirationTime - now;
  return isNaN(expirationTime) || diff <= 0 ? 0 : diff;
});

const { formattedTime: timerFormat, startStopwatch: timerStart, stopStopwatch: timerStop } = useTimer();
const { formattedTime: ttlFomat, startStopwatch: startTtl, stopStopwatch: stopTtl, resetStopwatch: resetTtl } = useTimer({
  reverse: ref(true),
  reverseCountDownFrom: ttl
});

watch(isRunning, (running) => {
  if (running) {
    timerStart();
    if (ttl.value > 0) {
      startTtl();
    }
  } else {
    timerStop();
    stopTtl();
    resetTtl();
  }
});

watch(ttl, (newTtlValue) => {
  if (newTtlValue > 0 && isRunning.value) {
    startTtl();
  }
});

onMounted(async () => {
  startEvents();
  await getAll();
});

onBeforeUnmount(() => {
   unBind();
});

</script>

<template>
  <Layout>
    <UDashboardPanel id="trade">
      <template #header>
        <UDashboardNavbar title="Trade">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <TradeModal
              :show-btn="true"

              btn-size="sm"
              :btn-color="'success'"
              :btn-label="'Create Wallets'"
              :btn-icon="'lucide:plus'" 
              title="Create Wallets"
              :msg="'Create newly fresh wallets'"
            > 
              <template #contentModal>
                <CreateWalletsForm />
              </template>
            </TradeModal>
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar>
          <template #left>
            <div class="flex justify-center items-center gap-3">
              <TradeModal
                :show-btn="true"
                btn-size="md"
                :btn-color="'success'"
                :btn-label="'Start'"
                :btn-icon="'i-lucide-play'" 
                title="Start Bot"
                :msg="'Start & Configure the volume bot'"
              > 
                <template #contentModal>
                  <VolumeBotsForm />
                </template>
              </TradeModal>

              <UButton
                label="Stop"
                variant="subtle"
                color="error"
                class="cursor-pointer"
                size="md"
                :loading="loadingStop"
                trailing-icon="i-lucide-square-pause"
                @click.prevent="stopVolumeBot"
              />
            </div>
          </template>

          <template #right>
            <div class="flex justify-center items-center gap-3">
              <UBadge
                icon="i-lucide-play"
                size="md"
                color="primary"
                variant="outline"
                :label="isRunning ? `Started at ${startedAtLabel}` : `Stopped at ${stoppedAtLabel}`"
              />
              <UBadge
                v-if="!isRunning && stats?.lastRun"
                icon="i-lucide-timer"
                size="md"
                color="primary"
                variant="outline"
                :label="`Last run ${dtFmtWithSeconds.format(new Date(stats.lastRun))}`"
              />
              
              <UBadge
                v-if="isRunning"
                icon="i-lucide-timer"
                size="md"
                color="primary"
                variant="outline"
                :label="`Running 
                ${timerFormat.days}:${timerFormat.hours}:${timerFormat.minutes}:${timerFormat.seconds}:${timerFormat.milliseconds}`"
              />
              
              <UBadge
                v-if="isRunning && hasExpiration"
                icon="i-lucide-hourglass"
                size="md"
                color="primary"
                variant="outline"
                :label="`Remaining ${ttlFomat.days}:${ttlFomat.hours}:${ttlFomat.minutes}:${ttlFomat.seconds}:${ttlFomat.milliseconds}`"
              />
            </div>
          </template>
        </UDashboardToolbar>
      </template>


      <template #body>
        <!-- <OffensiveSpinner class="my-10" /> -->
        <div class="flex flex-col gap-6">
          <Stats :stats="displayStats" />

          <ActivityFeed :activities="activity" />
          <Logs
            :raw-logs="rawLogs"
            :logs="logs"
            class="w-full"
            @clear="() => { logs = []; rawLogs = []; }"
          />
        </div>
      </template>
    </UDashboardPanel>
  </Layout>
</template>