export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'BUY' | 'SELL' | 'ERROR' | 'WARN' | 'OUT';
  message: string;
}
export interface ScrollAreaExpose {
  $el: HTMLElement
}
export interface Activity {
  id: number;
  wallet: string;
  action: 'Buy' | 'Sell';
  amount: string;
  status: 'success' | 'error';
  time: string;
}

export interface Status  { 
    status: 'running' | 'stopped';
    startedAt?: number; stoppedAt?: number;
    target?: string,
    expiredAt: number | Date,
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


  export type VolumeBotEvent =
  | { type: 'log'; payload: LogEntry }
  | { type: 'activity'; payload: Activity }
  | { type: 'stats'; payload: Stats }
  | { type: 'status'; payload: Status }
  | { type: 'ready'; payload: { pid: number } };