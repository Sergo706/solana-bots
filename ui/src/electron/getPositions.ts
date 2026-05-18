import { db } from '@solana-bots/db/connection';
import { positionsTable } from '@solana-bots/db';
import type { Results } from '@riavzon/utils';
import type { Positions } from '@/types/positons';

export async function getOpenPositions(): Promise<Results<Positions[]>> {
    try {
        const data = await db.select().from(positionsTable);
        if (data.length === 0) {
            return {
                ok:false,
                date: new Date().toISOString(),
                reason: 'No open positions'
            };
        }

        return {
            ok: true,
            date: new Date().toISOString(),
            data: data,
        };
    } catch {
       return {
            ok: false,
            date: new Date().toISOString(),
            reason: 'Database error'
       };
    }
}