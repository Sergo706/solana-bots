<script setup lang="ts">
import { h, resolveComponent, ref, onMounted } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Wallet } from '@/types/GetWallets';
import { dtFmt } from '@/utils/date';

const UBadge = resolveComponent('UBadge');

const props = defineProps<{
  data: Wallet[];
}>();

const locale = ref('en-US');
onMounted(() => { locale.value = navigator.language; });

const columns: TableColumn<Wallet>[] = [
  {
    accessorKey: 'id',
    header: '# ID',
    cell: ({ row }) => `#${String(row.getValue<number>('id'))}`
  },
  {
    accessorKey: 'publickey',
    header: 'Address',
    cell: ({ row }) => {
      const pk = row.getValue<string>('publickey');
      return pk;
    }
  },
  {
    accessorKey: 'balanceOfSOL',
    header: 'Balance',
    cell: ({ row }) => {
      const balance = row.getValue<number>('balanceOfSOL');
      return h(UBadge, { 
        variant: 'subtle', 
        color: balance > 0 ? 'success' as const : 'info' as const 
      }, () => `${balance.toFixed(9)} SOL`);
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => dtFmt.value.format(new Date(row.getValue<number>('created_at') * 1000))
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