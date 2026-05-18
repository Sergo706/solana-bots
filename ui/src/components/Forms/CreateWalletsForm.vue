<script setup lang="ts">
import { useCreateWallets } from '@/composables/createWallet';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { useRandomQuote } from '@/composables/randomQuetes';

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const {
  count,
  validate,
  create,
  loadingForm,
  success,
  successResponse,
  error
} = useCreateWallets(1);

const onSubmit = async () => {
  try {
    const api = await create();
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
        description: api.reason || 'An error occurred during wallet generation.',
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
    v-if="!loadingForm && !success"
    :validate="validate"
    :validate-on="[]"
    :state="{ count }"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Number of Wallets to Create"
      required
      name="count"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Specify how many new sub-wallets you want to create.
        </p>
      </template>
      <UInputNumber
        v-model="count"
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
      v-if="error"
      color="error"
      variant="subtle"
      title="Wallet Creation Failed"
      :description="error"
      icon="i-lucide-terminal"
    />

    <UButton
      type="submit"
      class="w-fit mt-4"
      :loading="loadingForm"
      trailing-icon="i-lucide-plus"
    >
      Generate Wallets
    </UButton>
  </UForm>


  <OffensiveSpinner v-else-if="loadingForm && !success" />

  <UPageCard
    v-if="success && successResponse" 
    title="Success!"
    highlight-color="success"
    variant="outline"
    icon="i-lucide-circle-check"
    :description="successResponse"
  />
</template>