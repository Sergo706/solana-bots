/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { massBuy } from "../massBuy.js";
import { massSell } from "../massSell.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { VolumeBotStats } from "../../../types/BotStats.js";
import { emit, emitActivity, emitLog, emitStats, type Stats } from "./events.js";
import { getEligibleWallets } from "../../../utils/getWalletsWithSOL.js";
import consola from "consola";
import { sleep } from "../../../utils/utils.js";
import type { Keypair } from "@solana/web3.js";
import { massOutForAllWallets } from "../massOut.js";

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

const PID_FILE = path.join(dataDir, 'volumeBot.pid');
const STATS_FILE = path.join(dataDir, "volumeBot.stats.json");
const STATS_FILE_UI = path.join(dataDir, "volumeBot.ui.json");


let stopping = false;

async function writeStats(stats: VolumeBotStats, statsUi: Stats) {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
    await fs.writeFile(STATS_FILE_UI, JSON.stringify(statsUi, null, 2), "utf-8");
  } catch (e) {
    consola.error(`[VolumeBot] Failed to write stats: ${e}`);
  }
}

async function cleanup() {
  stopping = true;
  await fs.unlink(PID_FILE).catch(() => { /* empty */ });
}


process.on('SIGTERM', () => {
  void cleanup();
});

process.on('SIGINT', () => {
  void cleanup();
});


const NETWORK_FEE_BUFFER = 0.005;

export async function volumeBot(
  targetMintAddress: string,
  maxSolPerWallet: number,
  numberOfWallets: number,
  password: string,
  interval?: number,
  shouldMassOut = true, 
  ttl?: number,
) {
  const startedAt = Date.now();
  const expiresAt = ttl ? startedAt + ttl * 1000 : Infinity;

  let walletOffset = 0;
  let activityId = 0;

  const stats: VolumeBotStats = {
    startedAt,
    runs: 0,
    buyCount: 0,
    sellCount: 0,
    errors: 0,
    status: "running",
    targetMintAddress,
  };

  const statsUi: Stats = {
    cycleRuns: 0,
    totalBuys: 0,
    totalSells: 0,
    errors: 0,
    status: 'running',
    target: targetMintAddress,
    currentAction: 'idle',
    lastRun: new Date().toISOString(), 
    pl: 0,
  };

  emit({ type: 'ready', payload: { pid: process.pid } });
  emit({ type: 'status', payload: { status: 'running', startedAt, target: targetMintAddress, expiredAt: expiresAt } });
  emitStats(statsUi);
  await writeStats(stats, statsUi);

  try {
    emitLog('INFO', `Volume bot started for ${targetMintAddress}`);

    while (!stopping && Date.now() < expiresAt) {
      stats.runs += 1;
      stats.lastRunAt = Date.now();

      statsUi.lastRun = new Date().toISOString();
      statsUi.cycleRuns += 1;
      statsUi.currentAction = 'buy';
      emitStats(statsUi);
      await writeStats(stats, statsUi);

      const currentBatchId = ++activityId;
      let cycleSpentSol = 0;
      let cycleReceivedSol = 0;

        const pool = await getEligibleWallets(password, maxSolPerWallet + NETWORK_FEE_BUFFER);
        if (pool.length < numberOfWallets) {
          stats.errors += 1;
          statsUi.errors += 1;

          emitLog('WARN', `Only ${pool.length} wallets available, need ${numberOfWallets}`);
          emitStats(statsUi);
          consola.error(`Only ${pool.length} wallets have enough SOL. Need ${numberOfWallets}.`);
          await writeStats(stats, statsUi);
          await sleep(5000);
          continue; 
      }

      const selectedWallets = [];
      for (let i = 0; i < numberOfWallets; i++) {
          const index = (walletOffset + i) % pool.length;
          selectedWallets.push(pool[index]);
      }
        walletOffset = (walletOffset + numberOfWallets) % pool.length;

        const selectedKeypairs = selectedWallets
          .filter((entry): entry is { wallet: Keypair; balance: number } => !!entry && !!entry.wallet)
          .map(entry => entry.wallet);
          
     try {
        emitLog('INFO', `Buying across ${selectedKeypairs.length} wallets`);
        const buyResult = await massBuy(targetMintAddress, maxSolPerWallet, numberOfWallets, password, 1, selectedKeypairs.length > 0 ? selectedKeypairs : undefined);


        cycleSpentSol = buyResult.data.walletsSpent.reduce((acc, curr) => acc + curr.spent, 0);

        stats.buyCount += 1;
        statsUi.totalBuys += 1;

        emitActivity({
          id: currentBatchId,
          wallet: `Batch ${activityId}`,
          action: 'Buy',
          amount: `${maxSolPerWallet} SOL`,
          status: 'success',
          time: new Date().toISOString(),
        });
        emitLog('BUY', `Buy cycle succeeded`);
        await writeStats(stats, statsUi);

      } catch (err) {
        stats.errors += 1;
        statsUi.errors += 1;
        const message = err instanceof Error ? err.message : String(err);

        emitLog('ERROR', `Buy failed: ${message}`);
        emitActivity({
          id: currentBatchId,
          wallet: `Batch ${activityId}`,
          action: 'Buy',
          amount: `${maxSolPerWallet} SOL`,
          status: 'error',
          time: new Date().toISOString(),
        });
        await writeStats(stats, statsUi);
      }

      emitStats(statsUi);
      await writeStats(stats, statsUi);
      if (stopping || Date.now() >= expiresAt) break;

      statsUi.currentAction = 'sell';
      emitStats(statsUi);
      await writeStats(stats, statsUi);

      try {
        emitLog('INFO', `Selling across ${selectedKeypairs.length} wallets`);
        const sellResult = await massSell(targetMintAddress, numberOfWallets, password, undefined, 1, selectedKeypairs.length > 0 ? selectedKeypairs : undefined);


        if (sellResult.ok && 'data' in sellResult && sellResult.data?.walletsSpent)  {
            cycleReceivedSol = sellResult.data.walletsSpent.reduce((acc, curr) => acc + curr.received, 0);
        }
        
        const cycleProfit = cycleReceivedSol - cycleSpentSol;
        statsUi.pl += cycleProfit;
        stats.sellCount += 1;
        statsUi.totalSells += 1;

        emitActivity({
          id: currentBatchId,
          wallet: `Batch ${activityId}`,
          action: 'Sell',
          amount: `${maxSolPerWallet} SOL`,
          status: 'success',
          time: new Date().toISOString(),
        });

        emitLog('SELL', `Sell cycle succeeded`);
        await writeStats(stats, statsUi);

      } catch (err) {
        stats.errors += 1;
        statsUi.errors += 1;
        const message = err instanceof Error ? err.message : String(err);
        emitActivity({
          id: currentBatchId,
          wallet: `Batch ${activityId}`,
          action: 'Sell',
          amount: `${maxSolPerWallet} SOL`,
          status: 'error',
          time: new Date().toISOString(),
        });
        emitLog('ERROR', `Sell failed: ${message}`);
        await writeStats(stats, statsUi);
      }

      emitStats(statsUi);
      await writeStats(stats, statsUi);
      await sleep(interval ?? 0);
      if (stopping || Date.now() >= expiresAt) break;
    }
  } finally {
    stats.status = "stopped";
    statsUi.status = "stopped";
    statsUi.currentAction = "idle";

    emitStats(statsUi);
    emit({ type: 'status', payload: { status: 'stopped', stoppedAt: Date.now(), target: targetMintAddress, expiredAt: expiresAt } });

    await writeStats(stats, statsUi);

    if (shouldMassOut) {
      try {
        emitLog('INFO', 'Closing all positions before shutdown...');
        consola.info("Closing all positions before shutdown...");
        const outResults = await massOutForAllWallets(password);
        
        if (outResults && 'data' in outResults && outResults.data?.walletsSpent) {
            const outReceivedSol = outResults.data.walletsSpent.reduce((acc, curr) => acc + curr.received, 0);
            statsUi.pl += outReceivedSol; 
            emitStats(statsUi);
        }

        consola.success("Mass out completed.");
        emitLog('INFO', 'Mass out completed.');
        emitLog('INFO', 'Volume Bot exited');

      } catch (err) {
        consola.error("Mass out failed:", err);
        const message = err instanceof Error ? err.message : String(err);
        emitLog('ERROR', `Mass out failed: ${message}`);
      }
  }
  
    await cleanup();
  }
}
