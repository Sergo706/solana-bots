
export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'BUY' | 'SELL' | 'ERROR' | 'WARN' | 'OUT';
  message: string;
}

export interface Activity {
  id: number;
  wallet: string;
  action: 'Buy' | 'Sell';
  amount: string;
  status: 'success' | 'error';
  time: string;
}

export interface Stats {
    cycleRuns: number;
    totalBuys: number;
    totalSells: number;
    errors: number;
    status: "running" | "stopped";
    target: string;
    currentAction: "buy" | "sell" | "idle"
    pl: number;
    lastRun: Date | string
}

export interface Status  { 
    status: 'running' | 'stopped';
    startedAt?: number; stoppedAt?: number;
    target?: string,
    expiredAt: number | Date,
}
  export type VolumeBotEvent =
  | { type: 'status'; payload: Status }
  | { type: 'ready'; payload: { pid: number } }  
  | { type: 'stats'; payload: Stats }
  | { type: 'log'; payload: LogEntry }
  | { type: 'activity'; payload: Activity }

export function emit(event: VolumeBotEvent) {
  process.stdout.write(`__BOT_METRIC__:${JSON.stringify(event)}\n`);
}

export function emitLog(level: LogEntry['level'], message: string) {
  emit({
    type: 'log',
    payload: {
      timestamp: new Date().toISOString(),
      level,
      message,
    },
  });
}

export function emitActivity(activity: Activity) {
  emit({ type: 'activity', payload: activity });
}

export function emitStats(stats: Stats) {
  emit({ type: 'stats', payload: stats });
}