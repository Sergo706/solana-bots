export interface VolumeBotStats {
  startedAt: number;
  lastRunAt?: number;
  runs: number;
  buyCount: number;
  sellCount: number;
  errors: number;
  status: "running" | "stopped";
  targetMintAddress: string;
};
