<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import { useDrainFunds } from '@/composables/withdrawnFunds';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { ref } from 'vue';
const {
  loadingForm,
  success,
  successResponse,
  dontShowAgainWarning,
  execute
} = useDrainFunds();

const choice = ref(false);

</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
    <div
      v-if="!loadingForm && !success"
      class="text-center space-y-4 border border-red-500/20 bg-red-500/5 p-6 rounded-xl"
    >
      <h3 class="text-lg font-bold text-red-500 flex items-center justify-center gap-2">
        <span class="i-lucide-octagon-alert w-5 h-5" />
        Drain all wallets
      </h3>
      <p class="text-xs text-neutral-400 leading-relaxed">
        Warning: Triggering this option commands the system to immediately drain
        <b>ALL</b> wallets to your main wallet. 
      </p>

      
      <UButton
        color="error"
        variant="solid"
        size="lg"
        icon="i-lucide-bomb"
        loading-auto
        @click="async () => { await execute(); dontShowAgainWarning = choice}"
      >
        Drain all wallets
      </UButton>
    </div>

    <OffensiveSpinner v-else-if="loadingForm && !success" />
    <div class="w-full mb-10">
      <UCheckbox
        v-model="choice"
        :default-value="false"
        color="success"
        indicator="end"
        variant="card"
        label="Don't show me this message again"
      />
    </div>
    
    <div
      v-if="success && successResponse"
      class="w-full max-w-md mx-auto p-2"
    >
      <UPageCard 
        highlight-color="success" 
        icon="i-lucide-circle-check" 
        title="Success!" 
        variant="subtle"
      >
        <template #description>
          <div class="space-y-3 mt-2 text-left">
            <div class="bg-neutral-900/40 border border-neutral-800 p-3 rounded-lg space-y-1">
              <span class="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">Status</span>
              <p class="text-xs font-mono text-primary-400 select-all break-all bg-black/30 p-2 rounded border border-neutral-800/60 mt-1">
                {{ successResponse }}
              </p>
            </div>
          </div>
        </template>
      </UPageCard>
    </div>
  </div>
</template>