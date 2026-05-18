<script setup lang="ts">
import { computed, h, resolveComponent, ref, onMounted } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { DateFormatter } from '@internationalized/date';
import type { Positions } from '@/types/positons';

const UBadge = resolveComponent('UBadge');

const props = defineProps<{
  data: Positions[];
}>();

const locale = ref('en-US');
onMounted(() => { locale.value = navigator.language; });

const dtFmt = computed(() => new DateFormatter(locale.value, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}));

const columns: TableColumn<Positions>[] = [
  {
    accessorKey: 'id',
    header: '# ID',
    cell: ({ row }) => `#${String(row.getValue<number>('id'))}`
  },
  {
    accessorKey: 'walletAddress',
    header: 'Wallet',
    cell: ({ row }) => {
      const pk = row.getValue<string>('walletAddress');
      return pk;
    }
  },
  {
    accessorKey: 'targetMintAddress',
    header: 'Token Mint',
    cell: ({ row }) => {
      const mint = row.getValue<string>('targetMintAddress');
      return mint;
    }
  },
  {
    accessorKey: 'solAmounts',
    header: 'SOL Amount',
    cell: ({ row }) => {
      const val = row.getValue<bigint | null>('solAmounts');
      if (!val) return '—';
      return h(UBadge, { variant: 'subtle', color: 'primary' as const }, () => 
        `${(Number(val) / 1e9).toFixed(9)} SOL`
      );
    }
  },
  {
    accessorKey: 'tokenAmount',
    header: 'Token Amount',
    cell: ({ row }) => {
      const val = row.getValue<bigint | null>('tokenAmount');
      if (!val) return '—';
      return String(val);
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => {
      const val = row.getValue<Date | null>('updatedAt');
      if (!val) return '—';
      return dtFmt.value.format(val);
    }
  }
];

</script>

<template>
  <UTable
    :data="props.data"
    :columns="columns"
    sticky
    :loading="false"
    loading-color="primary"
    loading-animation="carousel"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  />
</template>