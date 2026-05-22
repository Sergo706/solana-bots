<!-- eslint-disable @typescript-eslint/no-unnecessary-condition -->
<script setup lang="ts">
import { computed, h, onMounted, ref, resolveComponent, useTemplateRef } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { upperFirst } from 'scule';
import type { TradingTerminalData, UTableRef , Agg } from '@/types/TradingTerminal';
import type {
  FilterableTableApi,
  SortingItem,
} from '@/types/Tables';
import { useRandomQuote } from '@/composables/randomQuetes';
import TradeModal from '../Modals/TradeModal.vue';
import BuyForm from '../Forms/BuyForm.vue';
import SellForm from '../Forms/SellForm.vue';
import { useMassOut } from '@/composables/useOutAll';
import MassOutButton from '../Forms/MassOutButton.vue';
import { useMassSell } from '@/composables/useSell';
import LoadingModal from '../Modals/LoadingModal.vue';
import type { SellResponseMain } from '@/types/TradesResponse';
import { successModal } from '@/utils/tables/successModalSum';
import { formatDate } from '@/utils/date';
import { getSortableHeader } from '@/utils/tables/sortableHeader';
import type { ResultsWithId } from '@/types/OperationWorker';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const UCheckbox = resolveComponent('UCheckbox');
const rowSelection = ref<Record<string, boolean>>({});
const { execute, dontShowAgainWarning } = useMassOut();
const quote = ref();
const openLoadingModal = ref(false);

const { 
  loadingForm,
  loading,
  execute: execSell,
  successResponse,
  success,
  successRawResponse,
  targetMintAddress,
  targetedPositionsToSell,
  selectedSpecific,
  selectedWallets,
  numberOfWallets,
  
} = useMassSell();

const emit = defineEmits<(e: 'submitted') => void>();

defineProps<{
  data?: TradingTerminalData[]
}>();


const locale = ref('en-US');
onMounted(() => {
  locale.value = navigator.language;
});

const sorting = ref<SortingItem[]>([
  {
    id: 'positionOpenedAt',
    desc: true
  }
]);




const expanded = ref<Record<string, boolean>>({});

const columns: TableColumn<TradingTerminalData>[] = [
{
  id: 'select',
  header: ({ table }) => {
    const all = table.getIsAllPageRowsSelected();
    const some = table.getIsSomePageRowsSelected();

    return h(UCheckbox, {
      modelValue: some && !all ? 'indeterminate' : all,
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        table.toggleAllPageRowsSelected(value === true);
      }
    });
  },
  cell: ({ row }) => {
    return h(UCheckbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        row.toggleSelected(value === true);
      }
    });
  },
  enableSorting: false,
  enableHiding: false
},

  {
    id: 'expand',
    header: () => 'Wallets',
    cell: ({ row }) => {
      return h(UButton, {
        variant: 'ghost',
        color: 'neutral',
        size: 'xs',
        icon: row.getIsExpanded()
          ? 'i-lucide-chevron-down'
          : 'i-lucide-chevron-right',
        'aria-label': row.getIsExpanded()
          ? 'Collapse row'
          : 'Expand row',

        onClick: () => { row.toggleExpanded(); }
      });
    },

    enableSorting: false,
    enableHiding: false
  },

  {
    accessorKey: 'id',
    header: ({ column }) =>
      getSortableHeader(column, '# ID', {UButton, UDropdownMenu}),

    cell: ({ row }) => {
      return `# ${String(row.getValue<number>('id'))}`;
    }
  },

  {
    accessorKey: 'mint',
    header: ({ column }) =>
      getSortableHeader(column, 'Mint Address', {UButton, UDropdownMenu}),

    cell: ({ row }) => {
      return h(
        'span',
        {
          class: 'font-mono text-xs'
        },
        row.getValue<string>('mint')
      );
    }
  },

  {
    accessorKey: 'walletsIn',
    header: ({ column }) =>
      getSortableHeader(column, 'Wallets In', {UButton, UDropdownMenu}),
    cell: ({ row }) => {
      return String(row.getValue<number>('walletsIn'));
    }
  },

  {
    accessorKey: 'totalSolIn',
    header: ({ column }) =>
      getSortableHeader(column, 'Total SOL In', {UButton, UDropdownMenu}),

    cell: ({ row }) => {
      const value = row.getValue<number | bigint>('totalSolIn');

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: 'primary'
        },

        () => `${Number(value).toFixed(4)} SOL`
      );
    }
  },

  {
    accessorKey: 'positionOpenedAt',
    header: ({ column }) =>
      getSortableHeader(column, 'Opened At', {UButton, UDropdownMenu}),

    cell: ({ row }) => {
      return formatDate(
        row.getValue<Date>('positionOpenedAt')
      );
    }
  },

  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },

          items: getRowItems(row.original),

          'aria-label': 'Actions dropdown'
        },

        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',

            'aria-label': 'Actions dropdown'
          })
      );
    }
  }
];


function getRowItems(position: TradingTerminalData) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },

    {
      type: 'separator'
    },

    {
      label: 'Close This Position',
      color: 'error',
      async onSelect() {
       openLoadingModal.value = true;

        const wallets = position.wallets.map((a) =>  a.publickey);
        try {

            targetMintAddress.value = position.mint;
            numberOfWallets.value = position.walletsIn;
            selectedSpecific.value = true;
            selectedWallets.value = wallets;
            targetedPositionsToSell.value = position.positionIds;
  
          await execSell();
          if (success.value) {
            openLoadingModal.value = loadingForm.value || loading.value;
            if (successResponse.value) {
              await successModal(successResponse.value);
              emit('submitted');
            }
          }
          return ;
        } finally {
            openLoadingModal.value = false;
            targetMintAddress.value = '';
            numberOfWallets.value = 0;
            selectedSpecific.value = false;
            selectedWallets.value = [];
            targetedPositionsToSell.value = [];
        }
      }
    }
  ];
}



const table = useTemplateRef<UTableRef>('table');
const mint = computed({
  get: (): string => {
    const tableApi =
      table.value?.tableApi as
        | FilterableTableApi
        | undefined;

    const filterValue =
      tableApi
        ?.getColumn('mint')
        ?.getFilterValue();

    return typeof filterValue === 'string'
      ? filterValue
      : '';
  },

  set: (value: string) => {
    const tableApi =
      table.value?.tableApi as
        | FilterableTableApi
        | undefined;

    tableApi
      ?.getColumn('mint')
      ?.setFilterValue(value || undefined);
  }
});

const selectedPositions = computed(() => {
  return (
    table.value?.tableApi.getFilteredSelectedRowModel().rows.map((row) => row.original) ?? []
  );
});



async function closeSelected() {

  const positions = selectedPositions.value.map((position) => ({ ...position }));
  const targetMints = [...new Set(positions.map((pos) => pos.mint))];

  const results: ResultsWithId<SellResponseMain>[] = [];
  openLoadingModal.value = true;

try {
    for (const mint of targetMints) {
      const positionsForThisMint = positions.filter((p) => p.mint === mint);
      const keysForThisMint = positionsForThisMint.flatMap((p) => p.wallets.map((w) => w.publickey));
      const idsForThisMint = positionsForThisMint.flatMap((pos) => pos.positionIds);

      targetMintAddress.value = mint;
      numberOfWallets.value = keysForThisMint.length;
      selectedSpecific.value = true;
      selectedWallets.value = keysForThisMint;
      targetedPositionsToSell.value = idsForThisMint;
      
      await execSell();
      
      if (success.value && successRawResponse.value) {
          results.push(successRawResponse.value);
      }
    }

    if (results.length > 0) {

      const aggregated = results.reduce<Agg>(
          (acc, r) => {

            if (r.ok && r.data) {
              acc.positionsClosed += r.data.positionsClosed;
              acc.walletsCount += r.data.walletsCount;
              acc.failedWallets.push(...r.data.failedWallets);
              acc.walletsSpent.push(...r.data.walletsSpent);
              
            }
            return acc;
          },
          { 
            positionsClosed: 0, 
            walletsCount: 0, 
            failedWallets: [], 
            walletsSpent: []
          }
        );

      const finalSummary: SellResponseMain = {
          positionsClosed: aggregated.positionsClosed,
          walletsCount: aggregated.walletsCount,
          failedWallets: aggregated.failedWallets,
          walletsSpent: aggregated.walletsSpent
      };

      await successModal(finalSummary);
      emit('submitted');
    }
  } finally {
       openLoadingModal.value = false;
       targetMintAddress.value = '';
       numberOfWallets.value = 0;
       selectedSpecific.value = false;
       selectedWallets.value = [];
       targetedPositionsToSell.value = [];
  }
}

</script>

<template>
  <div
    v-if="data && data.length > 0"
    class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
  >
    <div class="flex items-center gap-2">
      <TradeModal
        :show-btn="true"
        btn-size="md"
        :btn-color="'success'"
        :btn-label="'Buy'"
        :btn-icon="'i-lucide-shopping-cart'" 
        title="Buy"
        :msg="'Start new positions'"
      > 
        <template #contentModal>
          <BuyForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <TradeModal
        :show-btn="true"

        btn-size="md"
        :btn-color="'primary'"
        :btn-label="'Sell'"
        :btn-icon="'i-lucide-trending-down'" 
        title="Sell"
        :msg="'Start mass sell'"
      > 
        <template #contentModal>
          <SellForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <TradeModal
        v-if="!dontShowAgainWarning"

        :show-btn="true"
        btn-size="md"
        :btn-color="'error'"
        :btn-label="'CLOSE ALL POSITIONS'"
        :btn-icon="'i-lucide-x-circle'" 
        title="Close all positions"
        :msg="'Close all open positions your sub wallets haves'"
      > 
        <template #contentModal>
          <MassOutButton 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>


      <UButton
        v-if="dontShowAgainWarning"
        label="CLOSE ALL POSITIONS"
        color="error"
        loading-auto
        variant="subtle"
        class="cursor-pointer"
        trailing-icon="i-lucide-x-circle"
        @click.prevent="execute"
      />
    </div>

    <UInput
      v-model="mint"
      class="w-full sm:max-w-sm"
      icon="i-lucide-search"
      placeholder="Filter by mint..."
    />

    <UDropdownMenu
      class="w-full sm:w-auto"
      :items="
        table?.tableApi
          ?.getAllColumns()
          .filter((column: any) => column.getCanHide())

          .map((column: any) => ({
            label: upperFirst(column.id),
            type: 'checkbox' as const,
            checked: column.getIsVisible(),
            onUpdateChecked(checked: boolean) {
              table?.tableApi
                ?.getColumn(column.id)
                ?.toggleVisibility(!!checked)
            },
            onSelect(e?: Event) {
              e?.preventDefault()
            }
          }))
      "
      :content="{ align: 'end' }"
    >
      <UButton
        label="Display"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-eye"
      />
    </UDropdownMenu>
    <div
      v-if="selectedPositions.length > 0"
      class="ml-auto flex items-center justify-center gap-2"
    >
      Selected

      <UBadge
        color="primary"
        variant="subtle"
      >
        {{ selectedPositions.length }} 
      </UBadge>

      <UButton
        label="Close Selected Positions"
        variant="subtle"
        color="primary"
        size="sm"
        loading-auto

        trailing-icon="i-lucide-x-circle"
        @click="closeSelected"
      />
    </div>
  </div>
  <LoadingModal v-model="openLoadingModal" />

  <UTable
    v-if="data && data.length > 0"
    ref="table"
    v-model:sorting="sorting"
    v-model:expanded="expanded"
    v-model:row-selection="rowSelection"
    :data="data || []"
    :columns="columns"
    :get-row-id="(row) => String(row.id)"
    sticky
    :loading="false"
    loading-color="primary"
    loading-animation="carousel"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      tr: 'data-[expanded=true]:bg-elevated/30',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  >
    <template #expanded="{ row }">
      <div class="p-4 bg-muted/40 border-b border-default">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs uppercase text-muted-foreground">
                Position Wallets
              </div>

              <div class="font-mono text-sm">
                {{ row.original.mint }}
              </div>
            </div>

            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ row.original.wallets.length }} Wallets
            </UBadge>
          </div>

          <div
            v-if="row.original.wallets?.length"
            class="grid grid-cols-1 gap-2 lg:grid-cols-2"
          >
            <div
              v-for="wallet in row.original.wallets"
              :key="wallet.id"
              class="rounded-lg border border-default bg-default p-3"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex flex-col gap-1 min-w-0">
                  <span class="text-xs text-muted-foreground">
                    Wallet
                  </span>

                  <span class="truncate font-mono text-xs">
                    {{ wallet.publickey }}
                  </span>
                </div>

                <UBadge
                  color="primary"
                  variant="subtle"
                >
                  {{
                    (wallet.balanceOfSOL / 1e9).toFixed(9)
                  }} SOL
                </UBadge>
              </div>

              <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>ID: {{ wallet.id }}</span>

                <span>
                  Created:
                  {{ formatDate(wallet.created_at * 1000) }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-sm italic text-muted-foreground"
          >
            No wallets associated with this position.
          </div>
        </div>
      </div>
    </template>
  </UTable>

  <UEmpty 
    v-if="(!data || data.length === 0)"
    class="flex-1 min-h-[550px] grid place-content-center text-center"
    icon="i-lucide-key-round"
    title="No positions yet" 
    description="Click buy to get started or click Pepe to get a motivation quote from him."
    :ui="{root: 'ring-0'}"
  > 
    <template #actions>
      <TradeModal
        :show-btn="true"

        btn-size="md"
        :btn-color="'success'"
        :btn-label="'Buy'"
        :btn-icon="'i-lucide-shopping-cart'" 
        title="Buy"
        :msg="'Start new positions'"
      > 
        <template #contentModal>
          <BuyForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <UButton
        label="Pepe"
        variant="outline"
        class="cursor-pointer"
        color="primary"
        size="md"
        trailing-icon="i-lucide-message-circle"
        @click="() => { quote = useRandomQuote() }"
      />
    </template>
  </UEmpty>
  <div
    v-if="quote && (!data || data.length === 0)"
    class="text-center mb-10"
  >
    <p class="italic text-muted opacity-80 leading-relaxed">
      {{ quote }}
    </p>
  </div>
</template>