<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type {  NavigationMenuItem } from '@nuxt/ui';
import { ref } from 'vue';
import LayoutLogo from '@/components/LayoutLogo.vue';


const open = ref(true);
const links: NavigationMenuItem[][] = [
  [
    {
      label: 'Home',
      icon: 'i-lucide-home',
      to: '/',
    },
    {
      label: 'Trade',
      icon: 'i-lucide-bar-chart-2',
      to: '/trade',
    },
    {
      label: 'AI Research',
      icon: 'i-lucide-cpu',
      to: '/ai',
    },
    {
      label: 'Volume Bot',
      icon: 'i-lucide-activity',
      to: '/volume-bot',
    },
    {
      label: 'Wallets',
      icon: 'i-lucide-wallet',
      to: '/wallets',
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: 'i-lucide-settings',
      type: 'trigger'
    }
  ]
];


</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      toggle-side="right"
      :toggle="{
        color: 'primary',
        variant: 'subtle',
        class: 'rounded-full'
      }"
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <LayoutLogo :is-text="!collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer>
        <p class="text-sm">
          Mode
        </p>
        <UColorModeSelect class="w-full" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>