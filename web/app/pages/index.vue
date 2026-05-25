<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">

const { data: page } = await useAsyncData('home', async () => {
  return await queryCollection('index').first();
});

definePageMeta({
  layout: 'default'
});

useHead({
  bodyAttrs: {
    class: 'overflow-x-hidden'
  }
});


</script>

<template>
  <SeoMetaData
    v-if="page"
    :page="page"
    :is-writing="false"
  />

  <UPageBody
    v-if="page"
    class="relative"
  >
    <div class="absolute top-[10%] -left-64 w-[600px] h-[600px] rounded-full bg-primary/30 dark:bg-primary/5 blur-[150px] animate-float-slow pointer-events-none" />

    <div class="absolute top-[30%] -right-64 w-[500px] h-[500px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/4 blur-[130px] animate-float-delayed pointer-events-none" />

    <div class="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500 dark:bg-amber-500/4 blur-[100px] animate-pulse-slow pointer-events-none" />
    <UPageHero
      v-if="page.hero"
      :title="page.title"
      :description="page.description"
      orientation="horizontal"
      :links="page.hero.links"
      class="relative min-h-[85vh]"
      :ui="{
        title: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
        description: 'text-lg sm:text-xl max-w-xl',
        container: 'gap-12 lg:gap-16'
      }"
    >
      <template #top>
        <div class="hero-grid-bg absolute inset-0 pointer-events-none" />

        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="scanline absolute w-full h-px bg-gradient-to-r from-transparent via-primary/80 dark:via-primary/30 to-transparent" />
        </div>
      </template>

      <template #headline>
        <UBadge
          v-if="page.hero.badge"
          variant="subtle"
          icon="i-lucide-terminal"
          class="animate-fade-in"
        >
          {{ page.hero.badge }}
        </UBadge>
      </template>

      <template #default>
        <WindowFrame
          v-if="page.hero.image"
          :src="page.hero.image.src"
          :alt="String(page.hero.image.alt)"
          :title="page.hero.image.title"
          loading="eager"
        />
      </template>
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :icon="section.icon"
      :orientation="section.orientation"
      :features="section.features"
      :links="section.links"
    >
      <WindowFrame
        v-if="section.image"
        :src="section.image.src"
        :height="section.image.height"
        :alt="String(section.image.alt)"
        :title="section.image.title"
      />
    </UPageSection>

    <UPageSection
      v-if="page.features"
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid 
        v-if="page.features.items"
        :ui="{
          base: 'relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-0 lg:grid-cols-3'
        }"
        class="mb-15"
      >
        <UPageCard
          v-for="(card, index) in page.features.items"
          :key="index"
          :ui="{
            root: 'relative flex'
          }"
          class="sm:rounded-none first:sm:rounded-l-lg last:sm:rounded-r-lg sm:-ml-px hover:z-10"
          spotlight
          variant="outline"
          spotlight-color="primary"
          v-bind="card"
        />
      </UPageGrid>
    </UPageSection>
  </UPageBody>
  
  <USeparator class="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
  <UPageCTA
    v-if="page && page.cta"
    :title="page.cta.title"
    class="overflow-hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
    variant="naked"
    :description="page.cta.description"
    :links="page.cta.links"
  > 
    <Starts />
  </UPageCTA>
</template>

<style scoped>
.hero-grid-bg {
  background-image:
    linear-gradient(to right, var(--ui-color-primary) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-color-primary) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.03;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%);
  animation: grid-drift 20s linear infinite;
}

@keyframes grid-drift {
  from { background-position: 0 0; }
  to { background-position: 60px 60px; }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-slow 10s ease-in-out 3s infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.08; }
}

.scanline {
  animation: scanline 4s ease-in-out infinite;
}

@keyframes scanline {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.animate-gradient-shift {
  animation: gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out both;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>