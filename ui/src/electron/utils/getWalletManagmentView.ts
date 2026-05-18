import type { WalletsManagementTable } from '@/types/GetWallets';
import type { Results } from '@riavzon/utils';
import { positionsTable } from '@solana-bots/db';
import { db } from '@solana-bots/db/connection';
import { getAllWalletsView } from '@solana-bots/lib/reads';
import { inArray } from 'drizzle-orm';

export async function getWalletsManagementView(password: string): Promise<Results<WalletsManagementTable[]>> {
  try {
    const wallets = await getAllWalletsView(password);

    if (!wallets || wallets.subs.length === 0) {
      return {
        ok: false,
        date: new Date().toISOString(),
        reason: 'NDATA'
      };
    }

    const subs = wallets.subs;
    const pubkeys = subs.map((k) => k.publickey);

    const openPositions = await db
      .select({
        walletAddress: positionsTable.walletAddress
      })
      .from(positionsTable)
      .where(inArray(positionsTable.walletAddress, pubkeys));

    const walletsWithPositions = new Set(
      openPositions.map((p) => p.walletAddress)
    );

    const dataShape: WalletsManagementTable[] = subs.map((sub) => {
      const publickey = sub.publickey;

      return {
        id: Number(sub.id),
        publickey,
        balanceOfSOL: sub.balanceOfSOL,
        created_at: sub.created_at ? sub.created_at * 1000 : 0,
        openPositions: walletsWithPositions.has(publickey)
      };
    });

    return {
      ok: true,
      date: new Date().toISOString(),
      data: dataShape
    };
  } catch (err) {
    return {
      ok: false,
      date: new Date().toISOString(),
      reason: err instanceof Error ? err.message : String(err)
    };
  }
}