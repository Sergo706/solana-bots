/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { defineCommand } from "citty";
import { consola } from "consola";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { VolumeBotStats } from "../../../types/BotStats.js";

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), "AppData", "Roaming"), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

const STATS_FILE = path.join(dataDir, "volumeBot.stats.json");

export const volumeStatus = defineCommand({
  meta: {
    name: "volume-status",
    description: "Shows the bot volume stats and status",
  },
  async run() {
    try {
      const raw = await fs.readFile(STATS_FILE, "utf8");
      const stats = JSON.parse(raw) as VolumeBotStats;

      consola.info(`Status: ${stats.status}`);
      consola.info(`Target: ${stats.targetMintAddress}`);
      consola.info(`Runs: ${stats.runs}`);
      consola.info(`Buys: ${stats.buyCount}`);
      consola.info(`Sells: ${stats.sellCount}`);
      consola.info(`Errors: ${stats.errors}`);
      consola.info(`Started: ${new Date(stats.startedAt).toLocaleString()}`);
      if (stats.lastRunAt) consola.info(`Last run: ${new Date(stats.lastRunAt).toLocaleString()}`);
    } catch {
      consola.warn("No stats found.");
    }
  },
});