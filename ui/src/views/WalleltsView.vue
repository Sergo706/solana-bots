<script setup lang="ts">
import WalletsManagementTable from '@/components/Tables/WalletsManagementTable.vue';
import { useGetWalletsManagement } from '@/composables/getWalletManagement';
import Layout from '@/Layout.vue';
import { onMounted } from 'vue';


const { error, loading, getAll, data } = useGetWalletsManagement();

const retry = async () => {
    await getAll();
};

onMounted(async () => {
    if (!data.value) await getAll();
});

</script>

<template>
  <Layout>
    <UDashboardPanel id="wallets">
      <template #header>
        <UDashboardNavbar title="Wallets">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <TradeModal
              :show-btn="true"

              btn-size="sm"
              :btn-color="'success'"
              :btn-label="'Buy'"
              :btn-icon="'i-lucide-shopping-cart'" 
              title="Buy"
              :msg="'Start new positions'"
            > 
              <template #contentModal>
                <BuyForm 
                  @submitted="retry"
                />
              </template>
            </TradeModal>
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar>
          <template #left>
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
          v-if="loading"
          class="mt-10"
        />

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

        <WalletsManagementTable
          v-if="!loading && (!error || error === 'NDATA')"
          :data="data ?? []"
          @submitted="retry"
        />
      </template>
    </UDashboardPanel>
  </Layout>
</template>