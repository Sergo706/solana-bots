<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { BuyResponse, SellResponseMain } from '@/types/TradesResponse';
import { dtFmtWithSeconds } from '@/utils/date';

interface FailedWallet {
  pubkey: string
  reason: string
}
interface WalletsSpent   { 
  pubkey: string;
  spent: number;
  received: number 
}

type Summary =
  | {
      mode: 'message'
      title: string
      message: string
      date?: string
    }
  | {
      mode: 'stats'
      title: string
      date?: string
      walletsCount: number
      positionsCount: number
      failedWallets: FailedWallet[]
      walletsSpent: WalletsSpent []
    }

const props = defineProps<{
  buy?: BuyResponse
  sell?: SellResponseMain
}>();

const columns: TableColumn<FailedWallet>[] = [
  {
    accessorKey: 'pubkey',
    header: 'Wallet'
  },
  {
    accessorKey: 'reason',
    header: 'Reason'
  }
];
const columnsForSpents: TableColumn<WalletsSpent>[] = [
  {
    accessorKey: 'pubkey',
    header: 'Wallet'
  },
  {
    accessorKey: 'spent',
    header: 'Amount Spent'
  },
  {
    accessorKey: 'received',
    header: 'Tokens received'
  }
];

const summary = computed<Summary | null>(() => {

  if (props.buy) {
    return {
      mode: 'stats',
      title: 'Buy completed',
      date: dtFmtWithSeconds.value.format(new Date()),
      walletsCount: props.buy.walletsCount,
      positionsCount: props.buy.positionsOpened,
      failedWallets: props.buy.failedWallets,
      walletsSpent: props.buy.walletsSpent
    };
  }

  if (props.sell) {
    if (typeof props.sell === 'string') {
      return {
        mode: 'message',
        title: 'Sell completed',
        date: dtFmtWithSeconds.value.format(new Date()),
        message: props.sell
      };
    }

    return {
      mode: 'stats',
      title: 'Sell completed',
      date: dtFmtWithSeconds.value.format(new Date()),
      walletsCount: props.sell.walletsCount,
      positionsCount: props.sell.positionsClosed,
      failedWallets: props.sell.failedWallets,
      walletsSpent: props.sell.walletsSpent
    };
  }

  return null;
});

</script>

<template>
  <UCard v-if="summary">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-semibold">
            {{ summary.title }}
          </h3>
          <p
            v-if="summary.date"
            class="text-xs text-muted-foreground"
          >
            {{ summary.date }}
          </p>
        </div>

        <UBadge
          color="success"
          variant="subtle"
        >
          Success
        </UBadge>
      </div>
    </template>

    <div v-if="summary.mode === 'message'">
      {{ summary.message }}
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UCard>
          <div class="text-xs uppercase text-muted-foreground">
            Wallets Count
          </div>
          <div class="text-2xl font-bold">
            {{ summary.walletsCount }}
          </div>
        </UCard>

        <UCard>
          <div class="text-xs uppercase text-muted-foreground">
            Positions {{ props.buy ? 'Opened' : 'Closed' }}
          </div>
          <div class="text-2xl font-bold">
            {{ summary.positionsCount }}
          </div>
        </UCard>
      </div>

      <UCard v-if="summary.failedWallets.length">
        <template #header>
          <div class="font-medium">
            Failed wallets
          </div>
        </template>

        <UTable
          :data="summary.failedWallets"
          :columns="columns"
        />
      </UCard>
      <div
        v-else
        class="text-sm text-muted-foreground italic px-1"
      >
        No failed wallets.
      </div>

      <USeparator />

      <UCard v-if="summary.walletsSpent.length">
        <template #header>
          <div class="font-medium">
            Spends
          </div>
        </template>

        <UTable
          :data="summary.walletsSpent"
          :columns="columnsForSpents"
        />
      </UCard>
      <div
        v-else
        class="text-sm text-muted-foreground italic px-1"
      >
        No transactions recorded.
      </div>
    </div>
  </UCard>

  <UCard v-else>
    <div class="text-sm text-muted-foreground">
      No result to display.
    </div>
  </UCard>
</template>