<script setup lang="ts">
const { open } = useContentSearch();
const searchTerm = ref('');

const { data: navigation } = await useAsyncData('navigation', () => {
    return queryCollectionNavigation('docs');
});

const { data: files, status } = useLazyAsyncData('search', () => {
    return queryCollectionSearchSections('docs');
}, {
    server: false
});

const groups = [{
    id: 'links',
    label: 'Explore',
    slot: 'links' as const,
    items: [
        { label: 'Getting Started', icon: 'i-lucide-rocket', to: '/docs/getting-started' },
        { label: 'CLI Guide', icon: 'i-lucide-terminal', to: '/docs/cli' },
        { label: 'Desktop App', icon: 'i-lucide-monitor', to: '/docs/desktop' },
        { label: 'Blog', icon: 'i-lucide-newspaper', to: '/blog' },
        { label: 'Download', icon: 'i-lucide-download', to: '/download' },
        { label: 'Security', icon: 'i-lucide-shield-check', to: '/legal/security' },
    ]
}];
</script>

<template>
  <UContentSearchButton
    :collapsed="true"
    variant="ghost"
    icon="i-lucide-search"
    @click="open = true"
  />

  <ClientOnly>
    <LazyUContentSearch
      v-model:search-term="searchTerm"
      :files="files"
      shortcut="meta_k"
      :navigation="navigation"
      :fuse="{ resultLimit: 42 }"
      :loading="status === 'pending'"
      :groups
      placeholder="Search documentation..."
    />
  </ClientOnly>
</template>