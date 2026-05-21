<script setup lang="ts">
import { computed, h, onMounted, ref, resolveComponent, useTemplateRef } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type {
  FilterableTableApi,
  SortingItem,
} from '@/types/Tables';
import { useRandomQuote } from '@/composables/randomQuetes';
import TradeModal from '../Modals/TradeModal.vue';
import LoadingModal from '../Modals/LoadingModal.vue';
import type { UTableRefWallet, WalletsManagementTable } from '@/types/GetWallets';
import { upperFirst } from 'scule';
import { getSortableHeader } from '@/utils/tables/sortableHeader';
import { formatDate } from '@/utils/date';
import CreateWalletsForm from '../Forms/CreateWalletsForm.vue';
import DistributeFundsForm from '../Forms/DistributeFundsForm.vue';
import DrainFundsForm from '../Forms/DrainFundsForm.vue';
import FastDrain from '../Forms/FastDrain.vue';
import { useDrainFunds } from '@/composables/withdrawnFunds';
import AddFundsForWallet from '../Forms/AddFundsForWallet.vue';


const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const UCheckbox = resolveComponent('UCheckbox');
const rowSelection = ref<Record<string, boolean>>({});
const quote = ref();
const openLoadingModal = ref(false);

const fundOpen = ref(false);
const activeWallet = ref<WalletsManagementTable | WalletsManagementTable[] | null>(null);
const emit = defineEmits<(e: 'submitted') => void>();


const props = defineProps<{
  data?: WalletsManagementTable[]
}>();


// @ts-expect-error empty state
const isEmpty = ref(('reason' in props.data && props.data.reason === 'NDATA') || props.data?.length === 0);
const singleTargetWallet = ref<string[]>([]);

const { 
  execute: executeIndividualDrain, 
  getAll: preloadDrainData,
  loadingForm,
  success,
  walletsLoading
} = useDrainFunds({
  selectedSpecific: ref(true),
  selectedWallets: singleTargetWallet
});
const { dontShowAgainWarning, execute } = useDrainFunds();

const locale = ref('en-US');
onMounted(async () => {
  locale.value = navigator.language;
  await preloadDrainData();
});

const sorting = ref<SortingItem[]>([
  {
    id: 'created_at',
    desc: true
  }
]);

const columns: TableColumn<WalletsManagementTable>[] = [
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
    accessorKey: 'id',
    header: ({ column }) => getSortableHeader(column, '# ID', {UButton, UDropdownMenu}),
    cell: ({ row }) => `# ${String(row.getValue<number>('id'))}`
  },
  {
    accessorKey: 'publickey',
    header: ({ column }) => getSortableHeader(column, 'Address', {UButton, UDropdownMenu}),
    cell: ({ row }) => {
      const pk = row.getValue<string>('publickey');
      return pk;
    }
  },
  {
    accessorKey: 'balanceOfSOL',
    header: ({ column }) => getSortableHeader(column, 'Balance', {UButton, UDropdownMenu}),
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
    header: ({ column }) => getSortableHeader(column, 'Created', {UButton, UDropdownMenu}),
    cell: ({ row }) => formatDate(row.getValue<Date>('created_at'))
  },

  {
    accessorKey: 'openPositions',
    header: ({ column }) => getSortableHeader(column, 'Haves Positions', {UButton, UDropdownMenu}),
    cell: ({ row }) => {
        const value = row.getValue<boolean>('openPositions');
        return value ? 'Yes' : 'No';  
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


function getRowItems(position: WalletsManagementTable) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },

        
    {
      label: 'Add Funds',
      icon: 'i-lucide-plus',
      color: 'neutral',
      onSelect() {
        activeWallet.value = position;
        fundOpen.value = true;
      }
    }, 
    {
      label: 'Drain wallet',
      icon: 'i-lucide-arrow-right',
      color: 'neutral',
      async onSelect() {
        openLoadingModal.value = true;
        try {
          singleTargetWallet.value = [position.publickey];
          
          await executeIndividualDrain();
          singleTargetWallet.value = [];
          emit('submitted');
        } finally {
          openLoadingModal.value = false;
        }
      }
    }
  ];
}



const table = useTemplateRef<UTableRefWallet>('table');


const selectedPositions = computed(() => {
  return (
    table.value?.tableApi.getFilteredSelectedRowModel().rows.map((row) => row.original) ?? []
  );
});

const wallet = computed({
  get: (): string => {
    const tableApi = table.value?.tableApi as | FilterableTableApi | undefined;
    const filterValue = tableApi?.getColumn('publickey')?.getFilterValue();
    return typeof filterValue === 'string' ? filterValue : '';
  },

  set: (value: string) => {
    const tableApi = table.value?.tableApi as | FilterableTableApi | undefined;
     tableApi?.getColumn('publickey')?.setFilterValue(value || undefined);
  }
});

function addBulkFunds() {
  const val = selectedPositions.value;
  activeWallet.value = val;
  fundOpen.value = true;
}

async function drainBulkFunds() {
  const pubkeys = selectedPositions.value.map(k => k.publickey);
  openLoadingModal.value = true;

  singleTargetWallet.value = pubkeys;

  try {
      await executeIndividualDrain();
      if (success.value) {
          openLoadingModal.value = loadingForm.value || walletsLoading.value;
          singleTargetWallet.value = [];
          emit('submitted');
      }
      return;
  } finally {
      openLoadingModal.value = false;
  }
}

</script>

<template>
  <div
    v-if="data && data.length > 0"
    class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
  >
    <AddFundsForWallet
      v-model="fundOpen"
      :wallet="activeWallet"
      @submitted="$emit('submitted')"
    />
    <div class="flex items-center gap-2">
      <TradeModal
        :show-btn="true"
        btn-size="md"
        :btn-color="'success'"
        :btn-label="'Create Wallets'"
        :btn-icon="'lucide:plus'" 
        title="Create Wallets"
        :msg="'Create newly fresh wallets'"
      > 
        <template #contentModal>
          <CreateWalletsForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <TradeModal
        :show-btn="true"

        btn-size="md"
        :btn-color="'primary'"
        :btn-label="'Add Funds'"
        :btn-icon="'i-lucide-trending-up'" 
        title="Add Funds"
        :msg="'Distribute Funds for your wallets'"
      > 
        <template #contentModal>
          <DistributeFundsForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <TradeModal
        :show-btn="true"

        btn-size="md"
        :btn-color="'primary'"
        :btn-label="'Withdrawn Funds'"
        :btn-icon="'i-lucide-arrow-right'" 
        title="Withdrawn Funds"
        :msg="'Withdrawn Funds from your wallet(s)'"
      > 
        <template #contentModal>
          <DrainFundsForm 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <TradeModal
        v-if="!dontShowAgainWarning"

        :show-btn="true"
        btn-size="md"
        :btn-color="'error'"
        :btn-label="'DRAIN ALL WALLETS'"
        :btn-icon="'i-lucide-arrow-right'" 
        title="DRAIN ALL WALLETS"
        :msg="'DRAIN ALL Funds to your main wallet'"
      > 
        <template #contentModal>
          <FastDrain 
            @submitted="$emit('submitted')"
          />
        </template>
      </TradeModal>

      <UButton
        v-if="dontShowAgainWarning"
        label="DRAIN ALL WALLETS"
        color="error"
        loading-auto
        variant="subtle"
        class="cursor-pointer"
        trailing-icon="i-lucide-x-circle"
        @click.prevent="execute"
      />
    </div>

    <UInput
      v-model="wallet"
      class="w-full sm:max-w-sm"
      icon="i-lucide-search"
      placeholder="Filter by wallet..."
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
        label="Add funds to selected"
        variant="subtle"
        color="primary"
        size="sm"
        loading-auto
        trailing-icon="i-lucide-plus"
        @click.prevent="addBulkFunds"
      />
      
      <UButton
        label="Drain funds"
        variant="subtle"
        color="primary"
        size="sm"
        loading-auto
        trailing-icon="i-lucide-arrow-right"
        @click.prevent="drainBulkFunds"
      />
    </div>
  </div>
  <LoadingModal v-model="openLoadingModal" />

  <UTable
    v-if="data && data.length > 0"
    ref="table"
    v-model:sorting="sorting"
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
  />

  <UEmpty 
    v-if="isEmpty"
    class="flex-1 min-h-[550px] grid place-content-center text-center"
    icon="i-lucide-key-round"
    title="No wallets yet" 
    description="You haven't created any wallets yet. Create some to start managing your funds."
    :ui="{root: 'ring-0'}"
  > 
    <template #actions>
      <TradeModal
        :show-btn="true"

        btn-size="md"
        :btn-color="'success'"
        :btn-label="'Create Wallets'"
        :btn-icon="'i-lucide-plus'"
        title="Create Wallets"
        :msg="'Create newly fresh wallets'"
      > 
        <template #contentModal>
          <CreateWalletsForm 
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
    v-if="quote && isEmpty"
    class="text-center mb-10"
  >
    <p class="italic text-muted opacity-80 leading-relaxed">
      {{ quote }}
    </p>
  </div>
</template>