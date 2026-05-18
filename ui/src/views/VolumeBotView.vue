<script setup lang="ts">
import Layout from '@/Layout.vue';
</script>

<template>
  <Layout>
    <UDashboardPanel id="volume-bot">
      <template #header>
        <UDashboardNavbar title="Volume Bot">
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
        <div class="flex flex-col gap-10 pb-4">
          <UButton
            v-if="1"
            class="ml-auto cursor-pointer -mt-7"
            to="/dashboard/manage"
            variant="subtle"
            label="Manage"
          />
          <UEmpty 
            v-else
            class="flex-1 min-h-[550px] grid place-content-center text-center"
            icon="i-lucide-key-round"
            title="No tokens yet" 
            description="It looks like you haven't created any tokens yet. Create one to get started."
            :ui="{root: 'ring-0'}"
            :actions="[
              {
                icon: 'i-lucide-key-round',
                label: 'Create token',
                class: 'cursor-pointer',
                variant: 'subtle',
                color: 'primary',
              },
              {
                icon: 'i-lucide-flask-conical',
                label: 'Playground',
                to: '/dashboard/playground',
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