<script setup lang="ts">

</script>
<template>
  <UApp>
    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        :key="$route.path"
      />
    </RouterView>
  </UApp>
</template>