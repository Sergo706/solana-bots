<script setup lang="ts">
import { useRandomQuote } from '@/composables/randomQuetes';
import { reactive, ref } from 'vue';


const stepThree = reactive({
  numberOfWallets: 5,
  solPerWallet: 0
});

const pepe = new URL('../../assets/public/new-pepe.webp', import.meta.url).href;
const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const loading = ref(false);
const toast = useToast();
const success = ref(false);
const smartQuote = useRandomQuote();

const onSubmit = async () => {
    loading.value = true;
    try {
        const api = await window.walletsApi.createWallet(stepThree.numberOfWallets);
        const gas = await window.walletsApi.distributeFunds(stepThree.solPerWallet);

        if (api.ok && gas.ok) {
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
            success.value = true;
            return;
        } else {
            if (!api.ok) {
            toast.add({
              title: 'Error',
              description: api.reason,
              color: 'error',
              duration: 10000,
              type: 'foreground',
              close: {
                  color: 'primary',
                  variant: 'outline',
                  class: 'rounded-full'
              }
          });
            return;
          } else if (typeof gas !== 'undefined' && !gas.ok) {
            toast.add({
              title: 'Error',
              description: gas.reason,
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
        }
    } catch {
            toast.add({
                title: 'Error',
                description: 'Something went wrong. try again later.',
                color: 'error',
                type: 'foreground',
                duration: 10000,
                close: {
                    color: 'primary',
                    variant: 'outline',
                    class: 'rounded-full'
                }
            });
          return;
    } finally {
        loading.value = false;
    }
};

</script>

<template>
  <UForm
    v-if="!success"
    :validate-on="[]"
    :state="stepThree"
    :loading-auto="true"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Number of sub-wallets"
      optional
      name="numberOfWallets"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The number of wallets you want to create to trade with. <br>
          Default 5
        </p>
      </template>

      <UInputNumber 
        v-model="stepThree.numberOfWallets"
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
      optional
      label="SOL Per sub wallet"
      name="solPerWallet"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The SOL you want to add to each sub-wallet taken from your main wallet.
        </p>
      </template>
      <UInputNumber
        v-model="stepThree.solPerWallet"
        :min="0"
        :step="0.000000001"
        class="w-full"
        :format-options="{
          signDisplay: 'always',
          minimumFractionDigits: 9,
          maximumFractionDigits: 9
        }"
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

    <UButton
      type="submit"
      class="w-fit"
      :loading="loading"
    >
      Submit
    </UButton>
  </UForm>

  <UPageCard 
    v-if="success"
    to="/trade"
    variant="outline"
    class="mt-5"
    :ui="{
      wrapper: 'flex flex-col items-center justify-center',
      title: 'text-base text-pretty font-semibold text-highlighted text-center',
      description: 'text-[15px] text-pretty text-center'
    }"
  >
    <template #title>
      <h1 class="text-2xl">
        Now go make money
      </h1>
    </template>
    <img
      :src="pepe"
      class="w-full"
    >
  </UPageCard>
</template>