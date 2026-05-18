<script setup lang="ts">
import Layout from '@/Layout.vue';
import type { NavigationMenuItem } from '@nuxt/ui';
import { useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useTradingView } from '@/composables/getTradingTerminal';
import OffensiveSpinner from '@/components/OffensiveSpinner.vue';
import { useGetPostions } from '@/composables/getPostions';

const route = computed(() => useRoute().path);
const { error, data, loading, getAll } = useTradingView();
const { error: postionsError, loading: postionsLoading, getAll: getAllPostions, data: positions } = useGetPostions();


const retry = async () => {
    await getAll();
    await getAllPostions();
  };

onMounted(async () => {
    await getAll();
    await getAllPostions();

});

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Trading Terminal',
      icon: 'i-lucide-trending-up',
      to: '/trade'
    },
    {
      label: 'Position Manager',
      icon: 'i-lucide-layout-list',
      to: '/trade/manager'
    }
  ]
];
</script>

<template>
  <Layout>
    <UDashboardPanel id="trade">
      <template #header>
        <UDashboardNavbar title="Trade">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <TradeModal
              btn-size="sm"
              :btn-color="'success'"
              :btn-label="'Create Wallets'"
              :btn-icon="'lucide:plus'" 
              title="Create Wallets"
              :msg="'Create newly fresh wallets'"
            > 
              <template #contentModal>
                <CreateWalletsForm />
              </template>
            </TradeModal>
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar>
          <template #left>
            <UNavigationMenu
              :items="items"
              highlight
              class="flex-1"
            />
          </template>
          <template #right>
            <UButton
              label="Refresh Data"
              variant="subtle"
              color="primary"
              size="sm"
              trailing-icon="i-lucide-rotate-cw"
              @click.prevent="retry"
            />
          </template>
        </UDashboardToolbar>
      </template>


      <template #body>
        <OffensiveSpinner 
          v-if="loading || postionsLoading"
          class="my-10"
        />


        <div
          v-if="(error || postionsError)"
          class="flex flex-col gap-10"
        >
          <UAlert
            v-if="error && error !== 'NDATA'"
            title="Error!"
            :description="error"
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

        <TradingTerminalTable 
          v-if="!loading && route === '/trade' && (!error || error === 'NDATA')"
          :data="data ?? []" 
        />
        <TradingPositionManagerTable 
          v-if="!postionsLoading && route === '/trade/manager' && (!postionsError || postionsError === 'No open positions')" 
          :data="positions ?? []"
        />
      </template>
    </UDashboardPanel>
  </Layout>
</template>