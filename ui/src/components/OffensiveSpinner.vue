<script setup lang="ts">
import { useRandomQuote } from '@/composables/randomQuetes';
import { ref } from 'vue';

const quete = ref(useRandomQuote());

setInterval(() => {
 quete.value = useRandomQuote();
}, 8000);

</script>

<template>
  <UPageCard
    variant="outline"
    :ui="{
      wrapper: 'flex flex-col flex-1 items-center justify-center',
    }"
  >
    <template #body>
      <div class="flex flex-col items-center justify-center text-center py-10 h-full gap-2">
        <div class="loading-container flex flex-col items-center">
          <div class="glow-spinner mb-4" />
          <h2 class="animate__animated animate__heartBeat animate__infinite infinite glow-text text-xl">
            Loading
          </h2>
        </div>
        <Transition
          :duration="{
            enter: 50,
            leave: 60
          }"
          name="fade"
          mode="out-in"
        >
          <p
            :key="quete"
            class="text-neutral-500 text-xs glow-text"
          >
            {{ quete }}
          </p>
        </Transition>
      </div>
    </template>
  </UPageCard>
</template>

<style scoped>

.fade-enter-active {
  transition: opacity 50ms ease-out;
}
.fade-leave-active {
  transition: opacity 100ms ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.glow-text {
  animation: text-glow 2s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(0, 255, 127, 0.2), 0 0 10px rgba(0, 255, 127, 0.2);
  }
  50% {
    text-shadow: 0 0 15px rgba(0, 255, 127, 0.8), 0 0 25px rgba(0, 255, 127, 0.5);
  }
}

.glow-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 127, 0.1);
  border-top: 3px solid #00ff7f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  filter: drop-shadow(0 0 8px #00ff7f);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>