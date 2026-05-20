<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRawWallets } from '@/composables/getAllRawWallets';
import { useRandomQuote } from '@/composables/randomQuetes';
import OffensiveSpinner from '../OffensiveSpinner.vue';
import type { BuyResponse } from '@/types/TradesResponse';
import type { SerializedWallet } from '@/types/positons';

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const emit = defineEmits<(e: 'submitted') => void>();
const { error, data, getAll, loading } = useRawWallets();
const selectedSpecific = ref(false);

const wallets = computed(() =>
  data.value?.subKeys.map((d) => ({
    label: `${String(d.pubkey).slice(0, 4)}...${String(d.pubkey).slice(-4)}`,
    value: d.pubkey
  })) ?? []
);



const selectedWallets = ref([]); 

onMounted(async () => {
    await getAll();
});

const state = reactive({
    target: '',
    solAmountsPerWallet: 0,
    numberOfWallets: selectedSpecific.value ? selectedWallets.value.length : 0,
    chosenWallets: selectedSpecific.value ? selectedWallets.value : []
});

const validate = (validateState: Partial<typeof state>) => {
    const errors = [];
    if (!validateState.target)  errors.push({name: 'target', message: 'Please provide a mint to buy'});
    if ((validateState.solAmountsPerWallet ?? 0) <= 0)  errors.push({name: 'solAmountsPerWallet', message: 'SOL amounts needs to be greater then 0'});

    if (!selectedSpecific.value && (validateState.numberOfWallets ?? 0) <= 0)  {
        errors.push({name: 'numberOfWallets', message: 'Please use at least one wallet'});
    }

    if (selectedSpecific.value && selectedWallets.value.length === 0)  {
        errors.push({name: 'chosenWallets', message: 'Please select wallets to buy with'});
    }
    return errors;
};
const toast = useToast();
const loadingForm = ref(false);
const success = ref(false);
const successResponse = ref<BuyResponse>();

const onSubmit = async () => {
    loadingForm.value = true;
    try {
        let specificWallets: SerializedWallet[] = [];

        if (selectedSpecific.value && selectedWallets.value.length > 0) {
            for (const wal of selectedWallets.value) {
                const current = data.value?.subKeys.find(k => k.pubkey === wal);

                if (!current) {
                    continue;
                }

                specificWallets.push({
                    secretKey: current.decryptedPrivate,
                    publicKey: String(current.pubkey)
                });
            }

            if (specificWallets.length === 0) {
                toast.add({
                    title: 'Error',
                    description: 'No wallets was found!',
                    color: 'error',
                    duration: 15000,
                    type: 'foreground',
                    close: {
                        color: 'primary',
                        variant: 'outline',
                        class: 'rounded-full'
                    }
                });

                loadingForm.value = false;
                return;
            }
        }
        const filtered = specificWallets.length > 0 ? specificWallets : undefined;
        const api = await window.tradesApi.buy(state.target, state.solAmountsPerWallet, state.numberOfWallets, undefined, filtered);

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
          success.value = true;
          successResponse.value = api.data;
          return;
        } else {
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
        }
    } catch (err) {
        console.error(err);

    const message = err instanceof Error? err.message : String(err);

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
          return;
    } finally {
        loadingForm.value = false;
    }
};

</script>

<template>
  <UForm
    v-if="(!loading && !loadingForm) && !success"
    :validate="validate"
    :validate-on="[]"
    :state="state"
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
          The target mint to buy
        </p>
      </template>

      <UInput
        v-model="state.target"
        placeholder="gdfgadh..."
        icon="i-lucide-lock"
        class="w-full"
      />
    </UFormField>

    <UFormField
      required
      label="SOL Amount Per Wallet" 
      name="solAmountsPerWallet"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The amount of SOL that will be used from <b>EACH</b> wallet.
        </p>
      </template>
      <UInputNumber
        v-model="state.solAmountsPerWallet"
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
        v-model="state.numberOfWallets"
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
        placeholder="Type a wallet..."
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
        label="Buy with targeted sub-wallets?"
        description="Mark this to select the wallets to be used in this buy operation"
      />
    </div>
    
    <UButton
      type="submit"
      class="w-fit"
      :loading="loadingForm"
    >
      Start Mass Buy
    </UButton>
  </UForm>
  <OffensiveSpinner v-else-if="(loading || loadingForm) && !success" />

  <TradeResonses
    v-if="success && successResponse" 
    :buy="successResponse" 
  />
</template>