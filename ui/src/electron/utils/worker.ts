/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { volumeBot } from '@solana-bots/lib/transactions/volumeBot/volumeBotWorker';

if (process.env['SOLANA_BOTS_INTERNAL'] === 'volume-worker') {
  try {
    await volumeBot(
      process.env['TARGET_MINT']!,
      Number(process.env['AMOUNT']),
      Number(process.env['WALLETS']),
      process.env['PASSWORD']!,
      Number(process.env['INTERVAL']),
      (process.env['MASS_OUT'] === 'true' ? true : false),
      process.env['TTL'] ? Number(process.env['TTL']) : undefined,
    );
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
  process.exit(0);
}