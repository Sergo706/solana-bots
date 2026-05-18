<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import { useMassOut } from '@/composables/useOutAll';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import TradeResonses from '../TradeResonses.vue';
const {
  loadingForm,
  success,
  successResponse,
  dontShowAgainWarning,
  execute
} = useMassOut();


</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
    <div
      v-if="!loadingForm && !success"
      class="text-center space-y-4 border border-red-500/20 bg-red-500/5 p-6 rounded-xl"
    >
      <h3 class="text-lg font-bold text-red-500 flex items-center justify-center gap-2">
        <span class="i-lucide-octagon-alert w-5 h-5" />
        Global Mass Out
      </h3>
      <p class="text-xs text-neutral-400 leading-relaxed">
        Warning: Triggering this option commands the system to immediately pull open data records across 
        <b>ALL</b> wallets and sell 100% of open token holdings back into SOL. 
      </p>

      
      <UButton
        color="error"
        variant="solid"
        size="lg"
        icon="i-lucide-bomb"
        loading-auto
        @click="execute"
      >
        Run Mass out
      </UButton>
    </div>

    <OffensiveSpinner v-else-if="loadingForm && !success" />
    <div class="w-full mb-10">
      <UCheckbox
        v-model="dontShowAgainWarning"
        :default-value="false"
        color="success"
        indicator="end"
        variant="card"
        label="Don't show this message again"
      />
    </div>
    
    <TradeResonses
      v-if="success && successResponse" 
      :sell="successResponse" 
    />
  </div>
</template>