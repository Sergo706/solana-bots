<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const { data: page } = await useAsyncData('download', async () => {
  return await queryCollection('download').first();
});

definePageMeta({
  layout: 'default'
});

useHead({
  bodyAttrs: {
    class: 'overflow-x-hidden'
  }
});

const links = ref<ButtonProps[]>([
  {
    label: 'Documentation',
    icon: 'i-lucide-book',
    to: '/docs',
  }
]);
// TODO API DOWNLOAD
</script>

<template>
  <UPageBody
    v-if="page"
  >
    <UPageHeader
      :title="page.pageHeader.title"
      :description="page.pageHeader.description"
      :links="links"
    >
      <template #headline>
        <UBadge
          variant="subtle"
          size="sm"
          class="mb-4 rounded-full"
        >
          {{ page.pageHeader.version }}
        </UBadge>
      </template>
    </UPageHeader>

    <div class="mt-24 text-center mb-12">
      <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
        {{ page.downloads.title }}
      </h2>
      <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
        {{ page.downloads.description }}
      </p>
    </div>

    <UPageList
      v-if="page.downloads.items"
      divide
      class="max-w-5xl mx-auto gap-6"
    >
      <UPageCard
        v-for="(card, index) in page.downloads.items"
        :key="index"
        :title="card.title"
        :description="card.description"
        :icon="card.icon"
        spotlight
        variant="outline"
        spotlight-color="primary"
        orientation="horizontal"
      >
        <div class="flex flex-col gap-3 mt-6 pt-6 border-neutral-200 dark:border-white/5">
          <UButton
            v-for="(link, linkIndex) in card.links"
            :key="linkIndex"
            v-bind="link"
            class="justify-center"
          />
        </div>
      </UPageCard>
      <USeparator />

      <UPageCard
        title="Disclaimer"
        description="By downloading this software you agree that you have read and understood the disclaimers and terms outlined in the next document."
        icon="i-lucide-alert-triangle"
        variant="outline"
        orientation="horizontal"
      >
        <div class="flex flex-col gap-3 mt-6 pt-6 border-neutral-200 dark:border-white/5">
          <UButton
            label="Read Disclaimer"
            to="/legal/disclaimer"
            icon="i-lucide-file-text"
            color="neutral"
            variant="soft"
            class="justify-center"
          />
        </div>
      </UPageCard>
    </UPageList>
  </UPageBody>
</template>