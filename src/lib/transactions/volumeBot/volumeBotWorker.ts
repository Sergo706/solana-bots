/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { massBuy } from "../massBuy.js";
import { massSell } from "../massSell.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { VolumeBotStats } from "../../../types/BotStats.js";

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


let stopping = false;
let shouldMassOut = false;

async function writeStats(stats: VolumeBotStats) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

async function cleanup() {
  stopping = true;
  await fs.unlink(PID_FILE).catch(() => { /* empty */ });
}


process.on('SIGTERM', () => {
  shouldMassOut = true;
  void cleanup();
});

process.on('SIGINT', () => {
  shouldMassOut = true;
  void cleanup();
});


const NETWORK_FEE_BUFFER = 0.005;

export async function volumeBot(
  targetMintAddress: string,
  maxSolPerWallet: number,
  numberOfWallets: number,
  password: string,
  ttl?: number,
) {
  const startedAt = Date.now();
  const expiresAt = ttl ? startedAt + ttl * 1000 : Infinity;
  let walletOffset = 0;
  
  const stats: VolumeBotStats = {
    startedAt,
    runs: 0,
    buyCount: 0,
    sellCount: 0,
    errors: 0,
    status: "running",
    targetMintAddress,
  };

  await writeStats(stats);

  try {
    while (!stopping && Date.now() < expiresAt) {
      stats.runs += 1;
      stats.lastRunAt = Date.now();

      
        const pool = await getEligibleWallets(password, maxSolPerWallet + NETWORK_FEE_BUFFER);
        if (pool.length < numberOfWallets) {
          consola.error(`Only ${pool.length} wallets have enough SOL. Need ${numberOfWallets}.`);
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
        await massBuy(targetMintAddress, maxSolPerWallet, numberOfWallets, password, 2, selectedKeypairs.length > 0 ? selectedKeypairs : undefined);
        stats.buyCount += 1;
      } catch {
        stats.errors += 1;
      }

      if (stopping || Date.now() >= expiresAt) break;

      try {
        await massSell(targetMintAddress, numberOfWallets, password, undefined, 2, selectedKeypairs.length > 0 ? selectedKeypairs : undefined);
        stats.sellCount += 1;
      } catch {
        stats.errors += 1;
      }

      await writeStats(stats);

      if (stopping || Date.now() >= expiresAt) break;
    }
  } finally {
    stats.status = "stopped";
    await writeStats(stats);

    if (shouldMassOut) {
      try {
        consola.info("Closing all positions before shutdown...");
        await massOutForAllWallets(password);
        consola.success("Mass out completed.");
      } catch (err) {
        consola.error("Mass out failed:", err);
      }
  }
  
    await cleanup();
  }
}
