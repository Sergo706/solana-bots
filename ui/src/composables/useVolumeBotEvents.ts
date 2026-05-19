import type { Activity, LogEntry, Stats, Status } from '@/types/VolumeBots';
import { ref } from 'vue';




export function useVolumeBotEvents() {
    const activity = ref<Activity[]>([]);
    const logs = ref<LogEntry[]>([]);
    const stats = ref<Stats>();
    const statsForComponent = ref<Omit<Stats, 'lastRun'>>();

    const status = ref<Status>();
    const rawLogs = ref<string[]>([]);
    const ready = ref<number>();

    let unbindStats: (() => void) | undefined;
    let unbindLogs: (() => void) | undefined;
    let unbindStatus: (() => void) | undefined;
    let unbindActivity: (() => void) | undefined;
    let unbindRawLogs: (() => void) | undefined;
    let unbindReady: (() => void) | undefined;


    const startEvents = () => {
        unbindStats = window.tradesApi.onVolumeBotStats((incomingStats) => {
            stats.value = incomingStats;
            statsForComponent.value = incomingStats;
         });

         unbindLogs = window.tradesApi.onVolumeBotLog((log) => {
            logs.value.push({
                timestamp: log.timestamp,
                level: log.level,
                message: log.message
             });
         });

         unbindActivity = window.tradesApi.onVolumeBotActivity((ac) => {
             activity.value.push({
                id: ac.id,
                wallet: ac.wallet,
                action: ac.action,
                amount: ac.amount,
                status: ac.status,
                time: ac.time
             });
         });

         unbindStatus = window.tradesApi.onVolumeBotStatus((sta) => {
            status.value = sta;
         });

         unbindRawLogs = window.tradesApi.onRawConsoleUpdate((log) => {
            rawLogs.value.push(log);
         });

          unbindReady = window.tradesApi.onVolumeBotReady((stat) => {
            ready.value = stat.pid;
         });
        };
        
        const unBind = () => {
           if(unbindStats) unbindStats();
           if(unbindLogs) unbindLogs();
           if(unbindStatus) unbindStatus();
           if(unbindActivity) unbindActivity();
           if(unbindRawLogs) unbindRawLogs();
           if(unbindReady) unbindReady();
        };

    return {
        startEvents,
        unBind,

        activity,
        logs,
        rawLogs,
        ready,
        stats,
        statsForComponent,
        status
    };

}