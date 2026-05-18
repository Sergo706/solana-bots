<script setup lang="ts">

</script>
<template>
  <UApp>
    <UMain>
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :key="$route.path"
        />
      </RouterView>
    </UMain>
  </UApp>
</template>