<!-- App.vue -->
<script setup lang="ts">
import WindowMenu from './components/WindowMenu.vue';
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen overflow-hidden">
      <WindowMenu />
      <UMain class="flex-1 overflow-auto min-h-0">
        <RouterView v-slot="{ Component }">
          <component
            :is="Component"
            :key="$route.path"
          />
        </RouterView>
      </UMain>
    </div>
  </UApp>
</template>