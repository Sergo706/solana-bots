<script setup lang="ts">

import type { NavigationMenuItem } from '@nuxt/ui';
import type { NavigationCollection } from '~~/shared/types/Navigation';
const route = useRoute();

const { data: navLinks } = await useAsyncData<NavigationCollection>('navLinks_footer', async () => {
  return await queryCollection('navigationMenu').first() as unknown as NavigationCollection;
});


const items = computed<NavigationMenuItem[]>(() => {
  const mappedLinks = (navLinks.value?.links ?? []).map((link): NavigationMenuItem => {
    if (link.nested) {
      return {
        label: link.label,
        to: link.to,
        active: route.path.startsWith(link.to),
      };
    }

    return {
      label: link.label,
      to: link.to,
      active: route.path === link.to,
    };
  });

  return [
    ...mappedLinks,
    {
      label: 'Security',
      to: '/legal/security',
      active: route.path === '/legal/security',
    },
    {
      label: 'Disclaimer',
      to: '/legal/disclaimer',
      active: route.path === '/legal/disclaimer',
    }
  ];
});

</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright Solana Bots © {{ new Date().getFullYear() }} All rights reserved
      </p>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton
        icon="i-lucide-globe"
        color="neutral"
        variant="ghost"
        to="https://riavzon.com"
        target="_blank"
        aria-label="Website"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/Sergo706/solana-bots"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>