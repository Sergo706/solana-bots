<!-- eslint-disable @typescript-eslint/no-unnecessary-condition -->
<script setup lang="ts">
import Layout from '@/Layout.vue';
import { computed, onMounted, ref } from 'vue';
import { useGetWallets } from '@/composables/getWallets';
import { useGetPostions } from '@/composables/getPostions';
import SubWalletsTable from '@/components/Tables/SubWalletsTable.vue';
import PostionsTable from '@/components/Tables/PostionsTable.vue';
import OffensiveSpinner from '@/components/OffensiveSpinner.vue';

const { error: walletsError, loading: walletsLoading, getAll: getAllWallets, wallets } = useGetWallets();
const { error: postionsError, loading: postionsLoading, getAll: getAllPostions, data: positions } = useGetPostions();


const retry = async () => {
    await getAllWallets();
    await getAllPostions();
};

onMounted(async () => {
    if(!wallets.value) await getAllWallets();
    if (!positions.value || positions.value.length === 0) await getAllPostions();
});

const totalSubWallets = computed(() => wallets.value?.subs?.length ?? 0);
const solInMainWallet = computed(() => wallets.value?.main?.balanceOfSOL ?? 0);
const openPositions = ref(positions.value?.length ?? 0);

const totalSolInSubs = computed(() => (
  wallets.value?.subs?.length
    ? wallets.value.subs.map(item => item.balanceOfSOL).reduce((a, b) => a + b, 0)
    : 0
));

</script>

<template>
  <Layout>
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar title="Home">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <TradeModal
              :show-btn="true"

              btn-size="sm"
              :btn-color="'success'"
              :btn-label="'Create Wallets'"
              :btn-icon="'lucide:plus'" 
              title="Create Wallets"
              :msg="'Create newly fresh wallets'"
            > 
              <template #contentModal>
                <CreateWalletsForm 
                  @submitted="retry"
                />
              </template>
            </TradeModal>
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar>
          <UButton
            label="Refresh Data"
            variant="subtle"
            color="primary"
            size="sm"
            trailing-icon="i-lucide-rotate-cw"
            @click="retry()"
          />
        </UDashboardToolbar>
      </template>


      <template #body>
        <OffensiveSpinner
          v-if="walletsLoading || postionsLoading"
          class="mt-10"
        />
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <Stats
            v-if="!walletsLoading && !postionsLoading"
            :total-sub-wallets
            :total-sol-in-subs
            :sol-in-main-wallet
            :open-positions
          />

          <USkeleton
            v-if="walletsLoading && postionsLoading"
            class="w-full h-300"
          />

          <div
            v-if="(walletsError || postionsError)"
            class="flex flex-col gap-10"
          >
            <UAlert
              v-if="walletsError"
              title="Error !"
              :description="walletsError === 'UNAUTHORIZED' ? 'Provide your password first' : walletsError"
              color="error"
              variant="subtle"
              :actions="[
                {
                  label: 'Add password',
                  color: 'warning',
                  variant: 'subtle',
                  onClick: () => retry()
                },
                {
                  label: 'Retry',
                  color: 'warning',
                  variant: 'subtle',
                  onClick: () => retry()
                },
              ]"
            />

            <UAlert
              v-if="postionsError && postionsError !== 'No open positions'"
              title="Error!"
              :description="postionsError"
              color="error"
              variant="subtle"
              :actions="[
                {
                  label: 'Retry',
                  color: 'warning',
                  variant: 'subtle',
                  onClick: () => retry()
                },
              ]"
            />
          </div>
          <UCard 
            v-if="!walletsLoading && (wallets && wallets.subs.length > 0)"
            title="Sub wallets"
            class="w-full overflow-hidden"
            :ui="{ body: 'p-0' }"
            description="Overview of your sub wallets"
          > 
            <SubWalletsTable :data="wallets.subs" />
          </UCard>

          <UCard 
            v-if="!postionsLoading && (positions && positions.length > 0)"
            class="w-full overflow-hidden"
            :ui="{ body: 'p-0' }"
            title="Open positions"
            description="Overview of your open positions"
          > 
            <PostionsTable :data="positions" />
          </UCard>
        </div>

        <div class="flex flex-col gap-10 pb-4">
          <UEmpty 
            v-if="!walletsLoading && !postionsLoading && (!wallets || !wallets.subs?.length) && (!positions || !positions.length)"
            class="flex-1 min-h-[550px] grid place-content-center text-center"
            icon="i-lucide-wallet"
            title="No Wallets or open positions yet" 
            description="It looks like you haven't created any wallets or opened any positions yet. Create one or two to get started."
            :ui="{root: 'ring-0'}"
            :actions="[
              {
                icon: 'i-lucide-plus',
                label: 'Create wallet',
                class: 'cursor-pointer',
                variant: 'subtle',
                color: 'primary',
                to: '/wallets'
              },
              {
                icon: 'i-lucide-activity',
                label: 'Start trading',
                to: '/trade',
                class: 'cursor-pointer',
                color: 'primary',
                variant: 'outline'
              }
            ]"
          />
        </div>
      </template>
    </UDashboardPanel>
  </Layout>
</template>