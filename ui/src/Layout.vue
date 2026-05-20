<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type {  NavigationMenuItem } from '@nuxt/ui';
import { ref } from 'vue';
import LayoutLogo from '@/components/LayoutLogo.vue';
import { useRandomQuote } from '@/composables/randomQuetes';


const open = ref(true);
const quote = ref(useRandomQuote());
const links: NavigationMenuItem[][] = [
  [
    {
      label: 'Home',
      icon: 'i-lucide-home',
      to: '/',
    },
    {
      label: 'Trade',
      icon: 'i-lucide-trending-up',
      to: '/trade',
    },
    {
      label: 'Manage Positions',
      icon: 'i-lucide-bar-chart-2',
      to: '/trade/manager',
    },
    // {
    //   label: 'AI Research',
    //   icon: 'i-lucide-cpu', // maybe later maybe not
    //   to: '/ai',
    // },
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
        <div
          v-if="!collapsed"
          class="px-4 py-4 mb-2"
        >
          <p class="text-xs italic text-muted opacity-80 leading-relaxed">
            {{ quote }}
          </p>
        </div>
      </template>

      <template #footer="{collapsed}">
        <p
          v-if="!collapsed"
          class="text-sm"
        >
          Mode
        </p>
        
        <UColorModeSelect 
          v-if="!collapsed"
          class="w-full"
        />

        <UColorModeButton 
          v-if="collapsed"
        />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>