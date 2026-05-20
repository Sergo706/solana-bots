import { db } from "@solana-bots/db/connection";
import { walletTable, positionsTable } from "@solana-bots/db";
import {eq} from 'drizzle-orm';
import type { TradingTerminalData } from "@/types/TradingTerminal";
import type { Results } from "@riavzon/utils";


export async function getPositionsView(): Promise<Results<TradingTerminalData[]>> {
    try {
        const data = await db.select({
                walletId: walletTable.id,
                publicAddress: walletTable.publicAddress,
                createdAt: walletTable.createdAt,
                positionId: positionsTable.id,
                targetMintAddress: positionsTable.targetMintAddress,
                solAmounts: positionsTable.solAmounts,
                tokenAmount: positionsTable.tokenAmount,
                walletRemainingBalance: positionsTable.walletRemainingBalance,
                updatedAt: positionsTable.updatedAt,
        }).from(walletTable)
          .innerJoin(positionsTable, eq(walletTable.publicAddress, positionsTable.walletAddress));
        
          if (data.length === 0) {
                return {
                    ok: false,
                    date: new Date().toISOString(),
                    reason: 'NDATA'
                };
          }

          const grouped = data.reduce<Record<string, TradingTerminalData>>((acc, curr) => {
            const mint = curr.targetMintAddress;
            acc[mint] ??= {
                    id: curr.positionId,
                    mint: curr.targetMintAddress,
                    walletsIn: 0,
                    totalSolIn: 0,
                    wallets: [],
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    positionOpenedAt: curr.updatedAt!,
                    positionIds: [],
                };
            acc[mint].walletsIn++;
            const solAmount = Number(curr.solAmounts ?? 0) / 1_000_000_000;
            acc[mint].totalSolIn = Number(acc[mint].totalSolIn) + solAmount;
            acc[mint].positionIds.push(curr.positionId);

            acc[mint].wallets.push({
                    id: curr.walletId,
                    created_at: curr.createdAt,
                    publickey: String(curr.publicAddress),
                    balanceOfSOL: Number(curr.walletRemainingBalance),
                });
            return acc;
          }, {});

          return {
            ok: true,
            date: new Date().toISOString(),
            data: Object.values(grouped)
          };

    } catch (err) {
        console.log(err);
        return {
            ok: false,
            date: new Date().toISOString(),
            reason: 'Database error' 
        };
    }
}