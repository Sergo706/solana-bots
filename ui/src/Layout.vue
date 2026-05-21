<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type {  NavigationMenuItem } from '@nuxt/ui';
import { ref } from 'vue';
import LayoutLogo from '@/components/LayoutLogo.vue';
import { useRandomQuote } from '@/composables/randomQuetes';
import { useSidebar } from './composables/useSidebar';

const { open } = useSidebar();
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
const logo = new URL('assets/public/smartpepe.jpg', import.meta.url).href;

</script>

<template>
  <UDashboardGroup
    unit="rem" 
    :ui="{ base: 'fixed inset-0 top-10 flex overflow-hidden' }"
  >
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
      :ui="{
        root: 'relative hidden lg:flex flex-col min-h-0 h-full w-(--width) shrink-0 border-e border-default',
        footer: 'lg:border-t lg:border-default'
      }"
    >
      <template #header="{ collapsed }">
        <LayoutLogo
          :logo="logo"
          :is-text="!collapsed"
        />
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