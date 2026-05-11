import { defineCommand } from "citty";
import { consola } from "consola";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

const PID_FILE = path.join(dataDir, "volumeBot.pid");

export const volumeStop = defineCommand({
  meta: {
    name: "volume-stop",
    description: "Stop the background volume bot",
  },
  async run() {
    try {
      const pid = Number((await fs.readFile(PID_FILE, "utf8")).trim());
      process.kill(pid, "SIGTERM");
      await fs.unlink(PID_FILE).catch(() => { /* empty */ });
      consola.success(`Stopped volume bot`);
    } catch {
      consola.warn("No running volume bot found.");
    }
  },
});