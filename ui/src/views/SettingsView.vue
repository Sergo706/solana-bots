<script setup lang="ts">
import Layout from '@/Layout.vue';
</script>

<template>
  <Layout>
    <UDashboardPanel id="settings">
      <template #header>
        <UDashboardNavbar title="Settings">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <UButton
              label="Create API Token"
              variant="subtle"
              color="primary"
              size="sm"
              trailing-icon="lucide:plus"
            />
          </template>
        </UDashboardNavbar>
      </template>


      <template #body>
        44444
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