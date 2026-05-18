<script setup lang="ts">
import { onMounted } from 'vue';
import { useDrainFunds } from '@/composables/withdrawnFunds';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { useRandomQuote } from '@/composables/randomQuetes';

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const {
  fee,
  selectedSpecific,
  selectedWallets,
  wallets,
  getAll,
  walletsLoading,
  walletsError,
  validate,
  submit,
  loadingForm,
  success,
  successResponse,
} = useDrainFunds();

onMounted(async () => {
  await getAll();
});

const onSubmit = async () => {
  try {
    const api = await submit();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!api) return;

    if (api.ok) {
      emit('submitted');
      toast.add({
        title: 'Success',
        description: smartQuote,
        color: 'success',
        type: 'foreground',
        duration: 8000,
        avatar: { src: smartPepe },
        close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
      });
    } else {
      toast.add({
        title: 'Error',
        description: api.reason || 'An error occurred during execution.',
        color: 'error',
        duration: 10000,
        type: 'foreground',
        close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    toast.add({
      title: 'Error',
      description: message,
      color: 'error',
      type: 'foreground',
      duration: 10000,
      close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
    });
  }
};
</script>

<template>
  <UForm
    v-if="(!walletsLoading && !loadingForm) && !success"
    :validate="validate"
    :validate-on="[]"
    :state="{ fee, selectedWallets }"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Priority Fee (Optional)"
      name="fee"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Custom priority fee program limit override for the allocation transactions. Default 5000 <br> (Change this only if you know the <b>EXACT</b> fee)
        </p>
      </template>

      <UInputNumber
        v-model="(fee as number)"
        :min="0"
        :step="0.000000001"
        :format-options="{
          signDisplay: 'never',
          minimumFractionDigits: 9,
          maximumFractionDigits: 9
        }"
        class="w-full"
      > 
        <template #decrement>
          <UButton
            size="xs"
            variant="subtle"
            icon="i-lucide-minus"
          />
        </template>

        <template #increment>
          <UButton
            size="xs"
            variant="subtle"
            icon="i-lucide-plus"
          />
        </template>
      </UInputNumber>
    </UFormField>


    <UFormField 
      v-if="selectedSpecific"
      class="w-full max-w-xs" 
      name="chosenWallets" 
      required 
    >
      <UInputMenu 
        v-model="(selectedWallets as string[])"
        :content="{ hideWhenEmpty: true }" 
        :items="wallets" 
        class="w-full" 
        clear 
        delete-icon="i-lucide-trash" 
        label-key="label" 
        multiple 
        placeholder="Select wallets to drain..." 
        value-key="value"
      />
    </UFormField>

    <div class="flex justify-start w-full max-w-xs">
      <UButton
        v-if="selectedSpecific"
        label="Refresh wallet list"
        size="xs"
        variant="subtle"
        trailing-icon="i-lucide-rotate-cw"
        @click.prevent="getAll()"
      />
    </div>

    <div class="w-full max-w-xs mb-10">
      <UCheckbox
        v-model="selectedSpecific"
        :default-value="false"
        indicator="end"
        variant="card"
        label="Distribute to specific targets?"
        description="Mark this to select individual specific wallets instead of automated systemic balance filling"
      />
    </div>

    <div class="w-full max-w-xs">
      <UAlert
        v-if="(walletsError) && selectedSpecific"
        color="error"
        variant="subtle"
        class="w-full" 
        title="Error"
        :description="walletsError"
        icon="i-lucide-terminal"
        :actions="[{
          label: 'Refresh wallet list',
          variant: 'subtle',
          icon: 'i-lucide-plus',
          onClick: () => { getAll() }
        }]"
      />
    </div>

    <UButton
      :loading="loadingForm"
      class="w-fit"
      icon="i-lucide-droplet"
      type="submit"
    >
      Drain Funds To Main
    </UButton>
  </UForm>


  <OffensiveSpinner v-else-if="(walletsLoading || loadingForm) && !success" />


  
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
</template>