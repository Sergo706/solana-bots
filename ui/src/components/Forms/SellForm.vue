<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useMassSell } from '@/composables/useSell';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { useRandomQuote } from '@/composables/randomQuetes';
import TradeResonses from '../TradeResonses.vue';

const {
  error,
  getAll,
  loading,
  wallets,
  targetMintAddress,
  numberOfWallets,
  sellPercentage,
  selectedSpecific,
  selectedWallets,
  validate,
  submit,
  loadingForm,
  success,
  successResponse
} = useMassSell();

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();


onMounted(async () => {
  await getAll();
});

const onSubmit = async () => {
  try {
    const api = await submit();
    console.log(api);
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
        close: {
          color: 'primary',
          variant: 'outline',
          class: 'rounded-full'
        }
      });
    } else {
      toast.add({
        title: 'Error',
        description: api.reason || 'An error occurred during execution.',
        color: 'error',
        duration: 10000,
        type: 'foreground',
        close: {
          color: 'primary',
          variant: 'outline',
          class: 'rounded-full'
        }
      });
    }
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    toast.add({
      title: 'Error',
      description: message,
      color: 'error',
      type: 'foreground',
      duration: 10000,
      close: {
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full'
      }
    });
  }
};
</script>

<template>
  <UForm
    v-if="(!loading && !loadingForm) && !success"
    :validate="validate"
    :validate-on="[]"
    :state="{ targetMintAddress, numberOfWallets, sellPercentage, selectedWallets }"
    :loading-auto="true"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Target mint"
      required
      name="target"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The token mint address you want to sell
        </p>
      </template>

      <UInput
        v-model="targetMintAddress"
        placeholder="Token mint address..."
        icon="i-lucide-lock"
        class="w-full"
      />
    </UFormField>

    <UFormField
      required
      label="Sell Percentage" 
      name="sellPercentage"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Percentage of tokens to sell from <b>EACH</b> active position (1-100).
        </p>
      </template>
      <UInputNumber
        v-model="sellPercentage"
        :min="1"
        :max="100"
        :step="1"
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
      v-if="error && selectedSpecific"
      color="error"
      variant="subtle"
      title="Error"
      :description="error"
      icon="i-lucide-terminal"
      :actions="[{
        label: 'Refresh wallet list',
        variant: 'subtle',
        icon: 'i-lucide-plus',
        onClick: () => { getAll() }
      }]"
    />


    <UFormField
      v-if="!selectedSpecific"
      required
      name="numberOfWallets"
      class="w-full max-w-xs"
    > 
      <template #help>
        <p class="text-neutral-500 text-xs">
          Select the count of wallets you want to use in this buy operation
        </p>
      </template>

      <UInputNumber 
        v-model="numberOfWallets"
        :default-value="5"
        :step="1"
        :min="0"
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
        placeholder="Select specific wallets to close..."
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
        label="Sell from targeted sub-wallets?"
        description="Mark this to select individual specific wallets containing positions"
      />
    </div>
    

    <UButton
      type="submit"
      class="w-fit"
      :loading="loadingForm"
    >
      Start Mass Sell
    </UButton>
  </UForm>


  <OffensiveSpinner v-else-if="(loading || loadingForm) && !success" />

  <TradeResonses
    v-if="success && successResponse" 
    :sell="successResponse" 
  />
</template>