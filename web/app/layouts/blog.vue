<!-- eslint-disable vue/multi-word-component-names -->

<script setup lang="ts">

const route = useRoute();

const { data: page } = await useAsyncData(`${route.path}_page`, () => {
  return queryCollection('blog').path(route.path).first();
});

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

</script>

<template>
  <UContainer class="max-w-[100rem]">
    <UPage
      v-if="page"
      as="article"
    >
      <UPageHeader
        :title="page.title"
        :description="page.description"
      >
        <template #headline>
          <div class="flex flex-col gap-6">
            <div class="flex gap-2 items-center flex-wrap">
              <UBadge
                :label="page.tags[0]"
                variant="subtle"
                color="primary"
                size="sm"
                icon="i-lucide-tag"
              />
              <UBadge
                :label="new Date(page.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })"
                variant="subtle"
                color="primary"
                size="sm"
                icon="i-lucide-calendar"
              />
              <UBadge
                :label="page.readingTime"
                variant="subtle"
                color="primary"
                size="sm"
                icon="i-lucide-clock"
              />
            </div>
            <LayoutBreadCrumbs />
          </div>
        </template>
        <template #links>
          <LayoutActionsDropdown 
            :content="page?.rawbody || page?.description || ''"
            :md-url="`https://raw.githubusercontent.com/Sergo706/solana-bots/main/web/content/${page?.stem ?? ''}.md`"
          />
        </template>

        <UUser
          class="mt-5"
          :to="page.authorGithub"
          target="_blank"
          :name="page.author"
          :description="page.authorGithubUserName"
          :avatar="{
            src: page.authorImg
          }"
        />
      </UPageHeader>

      <UPageBody as="section">
        <ProseImg
          :src="page.image"
          :alt="page.title"
          class="max-h-120 w-full object-cover rounded-lg"
        />
        <slot />
        <USeparator />
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
        >
          <Icon name="i-lucide-arrow-left" />
          Back to all posts
        </NuxtLink>
      </UPageBody>

      <template #right>
        <UContentToc
          highlight
          :links="page.body?.toc?.links"
        /> 
      </template>
    </UPage>
  </UContainer>
</template>