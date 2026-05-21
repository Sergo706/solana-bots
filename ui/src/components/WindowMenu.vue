<script setup lang="ts">
import { 
    minimize, 
    close,
    maximize,
    toggleDevTools,
    logo,
    goToAbout,
    newWindow,
    quit,
    reload,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleFullScreen,
} from '@/utils/windowMenuConstants';
import { ref } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import WindowMenuModals from './WindowMenuModals.vue';
import { useRouter } from 'vue-router';

const openBuy = ref(false);
const openSell = ref(false);
const openOut = ref(false);
const openVol = ref(false);
const openCreateWallets = ref(false);
const openAddFunds = ref(false);
const openDrain = ref(false);
const router = useRouter();

const fileItems = ref<DropdownMenuItem[][]>([
      [
         { 
          label: 'New Window',
          icon: 'i-lucide-app-window-mac', 
          onSelect: () => { newWindow(); }, 
          kbds: ['meta', 'n']
        }
      ],
    [
        { 
         label: 'Settings',
         icon: 'i-lucide-settings',
         onSelect: () => void router.replace({path: '/settings'}) 
        
        },
    ],
       [
          { label: 'Exit', icon: 'i-lucide-log-out', onSelect: () => { quit(); }, color: 'error' }
        ]
    ]);

const viewItems = ref<DropdownMenuItem[][]>([
    [   
     { label: 'Reload', icon: 'i-lucide-home', onSelect: () => { reload(); }, kbds: ['meta', 'r'] }, 
     { label: 'Zoom', icon: 'i-lucide-zoom-in', onSelect: () => { zoomIn(); }, kbds: ['meta', 'shift', 'z'] },
     { label: 'Zoom Out', icon: 'i-lucide-zoom-out', onSelect: () => { zoomOut(); }, kbds: ['meta', 'shift', 'o'] },
     { label: 'Reset Zoom', icon: 'i-lucide-search-slash', onSelect: () => { resetZoom(); }, kbds: ['meta', 'shift', 'r'] },
     { label: 'Full Screen', icon: 'i-lucide-search-slash', onSelect: () => { toggleFullScreen(); }, kbds: ['f11'] },
    ],
  [
    { label: 'Home', icon: 'i-lucide-home', onSelect: () => void router.replace('/') },
    { label: 'Trade Manager', icon: 'i-lucide-chart-candlestick', onSelect: () =>  void router.replace({path: '/trade/manager'}) },
    { label: 'Wallets', icon: 'i-lucide-wallet', onSelect: () => void router.replace('/wallets') },
    { label: 'Volume Bot', icon: 'i-lucide-activity', onSelect: () => void router.replace('/volume-bot') },
  ]
]);    


const tradeItem = ref<DropdownMenuItem[][]>([
  [
    { label: 'Buy', icon: 'i-lucide-shopping-cart', onSelect: () => openBuy.value = !openBuy.value, kbds: ['meta', 'b'] },
    { label: 'Sell', icon: 'i-lucide-trending-down', onSelect: () => openSell.value = !openSell.value, kbds: ['meta', 's'] },
    { label: 'Volume Bot', icon: 'i-lucide-activity', onSelect: () => openVol.value = !openVol.value, kbds: ['meta', 'v'] },
    { label: 'Mass out', icon: 'i-lucide-x-circle', onSelect: () => openOut.value = !openOut.value, color: 'error', kbds: ['meta', 'shift', 'o'] },
  ],
  [
    { label: 'Create Wallets', icon: 'i-lucide-plus', onSelect: () => openCreateWallets.value = !openCreateWallets.value, kbds: ['meta', 'w'] },
    { label: 'Add Funds', icon: 'i-lucide-trending-up', onSelect: () => openAddFunds.value = !openAddFunds.value, kbds: ['meta', 'f'] },
    { label: 'Drain Wallets', icon: 'i-lucide-arrow-right', onSelect: () => openDrain.value = !openDrain.value, color: 'warning', kbds: ['meta', 'd'] },
  ],
]);

const fileItemsShortCuts = extractShortcuts(fileItems.value, '_');
const viewItemsShortCuts = extractShortcuts(viewItems.value, '_');
const tradeItemShortCuts = extractShortcuts(tradeItem.value, '_');


defineShortcuts({
  'meta_shift_f11': () => { toggleDevTools(); },
  ...fileItemsShortCuts,
  ...viewItemsShortCuts,
  ...tradeItemShortCuts,
});

</script>

<template>
  <header
    class="flex items-center justify-between h-10 px-2 bg-muted border-b border-default select-none shrink-0"
    style="-webkit-app-region: drag;"
  >
    <WindowMenuModals
      :open-buy="openBuy"
      :open-sell="openSell"
      :open-out="openOut"
      :open-vol="openVol"
      :open-create-wallets="openCreateWallets"
      :open-add-funds="openAddFunds"
      :open-drain="openDrain"
      @close="(e) => {
        openBuy = e
        openSell = e
        openOut = e
        openVol = e
        openCreateWallets = e
        openAddFunds = e
        openDrain = e
      }"
    />

    <nav
      class="flex items-center"
      style="-webkit-app-region: no-drag;"
    >
      <LayoutLogo
        :is-text="false"
        :logo="logo"
        size="xs"
      />

      <UDropdownMenu
        :items="fileItems"
        :content="{ align: 'start', sideOffset: 4 }"
      >
        <UButton
          label="File"
          variant="ghost"
          color="neutral"
          size="xs"
        />
      </UDropdownMenu>

      <UDropdownMenu
        :items="tradeItem"
        :content="{ align: 'start', sideOffset: 4 }"
      >
        <UButton
          label="Trade & Wallets"
          variant="ghost"
          color="neutral"
          size="xs"
        />
      </UDropdownMenu>

      <UDropdownMenu
        :items="viewItems"
        :content="{ align: 'start', sideOffset: 4 }"
      >
        <UButton
          label="View"
          variant="ghost"
          color="neutral"
          size="xs"
        />
      </UDropdownMenu>

      <UButton
        label="About"
        variant="ghost"
        color="neutral"
        size="xs"
        @click.prevent="goToAbout()"
      />
    </nav>

    <div
      class="flex items-center gap-2"
      style="-webkit-app-region: no-drag;"
    >
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-minus"
        aria-label="Minimize"
        class="cursor-pointer"
        @click="minimize"
      />
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-maximize"
        class="cursor-pointer"
        aria-label="Maximize"
        @click="maximize"
      />
      <UButton
        variant="ghost"
        class="cursor-pointer"
        color="error"
        size="xs"
        icon="i-lucide-x"
        aria-label="Close"
        @click="close"
      />
    </div>
  </header>
</template>