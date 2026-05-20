<script setup lang="ts">
import Layout from '@/Layout.vue';
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
      </template>


      <template #body>
        <!-- Maybe later maybe not -->
        <OffensiveSpinner class="my-10" />
      </template>
    </UDashboardPanel>
  </Layout>
</template>