<script setup lang="ts">
import { onMounted } from 'vue';
import { useDistributeFunds } from '@/composables/addFunds';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { useRandomQuote } from '@/composables/randomQuetes';

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const {
  amountPerWallet,
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
  error
} = useDistributeFunds();

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
    :state="{ amountPerWallet, fee, selectedWallets }"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Amount per Wallet (SOL)"
      required
      name="amountPerWallet"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The exact balance of SOL to distribute into <b>EACH</b> targeted deployment sub-wallet.
        </p>
      </template>

      <UInputNumber
        v-model="amountPerWallet"
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
      label="Priority Fee (Optional)"
      name="fee"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Custom priority fee program limit override for the transactions. Default 5000 <br> (Change this only if you know the <b>EXACT</b> fee)
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

    <UAlert
      v-if="(walletsError || error) && selectedSpecific"
      color="error"
      variant="subtle"
      title="Error"
      :description="walletsError || error"
      icon="i-lucide-terminal"
      :actions="[{
        label: 'Refresh wallet list',
        variant: 'subtle',
        icon: 'i-lucide-plus',
        onClick: () => { getAll() }
      }]"
    />

    <UFormField
      v-if="selectedSpecific"
      name="chosenWallets"
      class="w-full max-w-xs"
      required
    >
      <UInputMenu
        v-model="selectedWallets"
        :items="wallets"
        label-key="label"
        value-key="value"
        class="w-full"
        clear
        delete-icon="i-lucide-trash"
        multiple
        :content="{ hideWhenEmpty: true }"
        placeholder="Select specific wallets to fund..."
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

    <UButton
      type="submit"
      class="w-fit"
      :loading="loadingForm"
    >
      Start Fund Distribution
    </UButton>
  </UForm>

  <OffensiveSpinner v-else-if="(walletsLoading || loadingForm) && !success" />
  
  <div
    v-if="success && successResponse"
    class="w-full max-w-md mx-auto p-2"
  >
    <UPageCard
      title="Success!"
      highlight-color="success"
      variant="subtle"
      icon="i-lucide-circle-check"
    >
      <template #description>
        <div class="space-y-3 mt-2 text-left">
          <div class="bg-neutral-900/40 border border-neutral-800 p-3 rounded-lg space-y-1">
            <span class="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">Status</span>
            <p class="text-sm font-medium text-neutral-200 font-mono break-all">
              {{ successResponse.sent }}
            </p>
          </div>
          
          <div class="bg-neutral-900/40 border border-neutral-800 p-3 rounded-lg space-y-1">
            <span class="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">Last Signature</span>
            <p class="text-xs font-mono text-primary-400 select-all break-all bg-black/30 p-1.5 rounded border border-neutral-800/60">
              {{ successResponse.lastSignature }}
            </p>
          </div>
        </div>
      </template>
    </UPageCard>
  </div>
</template>