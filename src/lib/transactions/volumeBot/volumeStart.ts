/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { defineCommand } from 'citty';
import { consola } from 'consola';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

const PID_FILE = path.join(dataDir, 'volumeBot.pid');

export const volumeStart = defineCommand({
  meta: {
    name: 'Start Volume Bot',
    description: 'Start the volume bot in the background',
  },
  args: {
    target: {
      type: "string",
      required: true,
      description: "The SPL token mint address to target (The coin).",
      valueHint: "..."
    },
    wallets: {
      type: "string",
      required: false,
      default: "1",
      description: "Number of sub-wallets to use for volume trading.",
      valueHint: "1"
    },
    amount: {
      type: "string",
      required: true,
      description: "Amount of SOL to use per trade for each wallet.",
      default: "0.01",
      valueHint: "0.01"
    },
    password: {
      type: "string",
      required: true,
      description: "Master password used to decrypt your stored wallets.",
      valueHint: "mySecurePassword"
    },
    ttl: {
      type: "string",
      required: false,
      default: "60",
      description: "Optional time-to-live for the bot to run in seconds. if not added the bot will stop after 60s",
      valueHint: "60"
    },
  },

  async run({ args }) {
    try {
          const existingPid = Number(await fs.readFile(PID_FILE, 'utf8'));
          process.kill(existingPid, 0);
          consola.warn(`Volume bot already running: ${existingPid}`);
          return;
    } catch { }
    
        await fs.mkdir(dataDir, { recursive: true });
        const child = spawn(process.execPath, process.argv.slice(1), {
            detached: true,
            stdio: "ignore",
            env: {
                ...process.env,
                SOLANA_BOTS_INTERNAL: "volume-worker",
                TARGET_MINT: args.target,
                WALLETS: args.wallets,
                AMOUNT: args.amount,
                PASSWORD: args.password,
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                TTL: args.ttl ?? "",
            },
        });

        child.unref();

        await fs.writeFile(PID_FILE, String(child.pid));
        consola.success(`Volume bot started in background. PID: ${child.pid}`);
  },
  
});