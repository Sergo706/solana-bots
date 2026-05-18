<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { BuyResponse, SellResponseMain } from '@/types/TradesResponse';

interface FailedWallet {
  pubkey: string
  reason: string
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

const summary = computed<Summary | null>(() => {
  if (props.buy) {
    return {
      mode: 'stats',
      title: 'Buy completed',
      date: props.buy.date,
      walletsCount: props.buy.data.walletsCount,
      positionsCount: props.buy.data.positionsOpened,
      failedWallets: props.buy.data.failedWallets
    };
  }

  if (props.sell) {
    if (typeof props.sell.data === 'string') {
      return {
        mode: 'message',
        title: 'Sell completed',
        date: props.sell.date,
        message: props.sell.data
      };
    }

    return {
      mode: 'stats',
      title: 'Sell completed',
      date: props.sell.date,
      walletsCount: props.sell.data.walletsCount,
      positionsCount: props.sell.data.positionsClosed,
      failedWallets: props.sell.data.failedWallets
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
        class="text-sm text-muted-foreground"
      >
        No failed wallets.
      </div>
    </div>
  </UCard>

  <UCard v-else>
    <div class="text-sm text-muted-foreground">
      No result to display.
    </div>
  </UCard>
</template>