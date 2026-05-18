<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { TabsItem } from '@nuxt/ui';
import { useRandomQuote } from '@/composables/randomQuetes';

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();

const type = ref<'wallet' | 'api'>('wallet');
const loading = ref(false);
const showPassword = ref(false);
const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const title = computed(() => type.value === 'wallet' ? 'Update Main Wallet' : 'Update Jupiter API Key');
const dec = computed(() => type.value === 'wallet' ? 'Update the main wallet that will be used across the system' : 'Update the RPC and Jupiter API Key');

const tabItems = ref<TabsItem[]>([
  {
    label: 'Main Wallet',
    icon: 'i-lucide-wallet',
    value: 'wallet'
  },
  {
    label: 'API & RPC',
    icon: 'i-lucide-cloud',
    value: 'api'
  }
]);

const walletState = reactive({
  privateKey: ''
});

const apiState = reactive({
  api: '',
  rpc: 'https://api.mainnet.solana.com'
});

const validateWallet = (state: Partial<typeof walletState>) => {
  const errors = [];
  if (!state.privateKey) {
    errors.push({ name: 'privateKey', message: 'Please provide your private key' });
  }
  return errors;
};

const validateApi = (state: Partial<typeof apiState>) => {
  const errors = [];
  if (!state.api) {
    errors.push({ name: 'api', message: 'Please provide your api key' });
  }
  return errors;
};

const onWalletSubmit = async () => {
  loading.value = true;
  try {
    const api = await window.walletsApi.updateMainWallet(walletState.privateKey);
    if (api.ok) {
        toast.add({
            title: 'Success',
            description: smartQuote,
            color: 'success',
            type: 'foreground',
            duration: 15000,
            avatar: { src: smartPepe },
            close: {
                color: 'primary',
                variant: 'outline',
                class: 'rounded-full'
            }
        });
      emit('submitted');
      walletState.privateKey = ''; 
      return;
    } else {
      toast.add({
        title: 'Error',
        description: api.reason || 'Failed to update main wallet.',
        color: 'error',
        duration: 10000,
        type: 'foreground',
        close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong. Try again later.';
    toast.add({
      title: 'Error',
      description: msg,
      color: 'error',
      type: 'foreground',
      duration: 10000,
      close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
    });
  } finally {
    loading.value = false;
  }
};

const onApiSubmit = async () => {
  loading.value = true;
  try {
    const api = await window.password.saveRpcAndAPi(apiState.api, apiState.rpc);
    if (api.ok) {
      toast.add({
          title: 'Success',
          description: smartQuote,
          color: 'success',
          type: 'foreground',
          duration: 15000,
          avatar: { src: smartPepe },
          close: {
              color: 'primary',
              variant: 'outline',
              class: 'rounded-full'
          }
      });
      emit('submitted');
      return;
    } else {
      toast.add({
        title: 'Error',
        description: api.reason,
        color: 'error',
        duration: 10000,
        type: 'foreground',
        close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
      });
    }
  } catch {
    toast.add({
      title: 'Error',
      description: 'Something went wrong. Try again later.',
      color: 'error',
      type: 'foreground',
      duration: 10000,
      close: { color: 'primary', variant: 'outline', class: 'rounded-full' }
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UCard 
    variant="subtle"
    class="space-y-4 w-full max-w-2xl ml-auto mr-auto mt-[10%]"
  >
    <template #header>
      <UTabs 
        v-model="type" 
        :items="tabItems" 
        :content="false"
        :ui="{ trigger: 'grow' }" 
        color="neutral"
        variant="link"
        class="gap-6 w-full mb-6"
      />

      <div class="flex flex-col justify-center items-center gap-3 text-center">
        <UIcon
          :name="type === 'wallet' ? 'i-lucide-wallet' : 'i-lucide-cloud'"
          size="50"
          class="text-neutral-400"
        />
        <h2 class="text-md font-bold text-neutral-100">
          {{ title }}
        </h2>
        <p class="text-xs text-neutral-400 max-w-sm">
          {{ dec }}
        </p>
      </div>
    </template>

    <div class="py-2">
      <UForm
        v-if="type === 'wallet'"
        :validate="validateWallet"
        :validate-on="[]"
        :state="walletState"
        :loading-auto="true"
        class="space-y-4 flex flex-col items-center justify-center w-full"
        @submit.prevent="onWalletSubmit"
      >
        <UFormField
          label="Raw Private Key"
          required
          name="privateKey"
          class="w-full max-w-xs"
        >
          <template #help>
            <p class="text-neutral-500 text-xs">
              Provide your wallet's private key.
              <br>
              <b>WARNING: This will delete your old wallet from the system completely</b>
            </p>
          </template>
          <UInput
            v-model="walletState.privateKey"
            placeholder="Enter private key..."
            icon="i-lucide-key"
            :type="showPassword ? 'text' : 'password'"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="xs"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          class="w-fit"
          color="primary"
          :loading="loading"
        >
          Update Wallet
        </UButton>
      </UForm>

      <UForm
        v-if="type === 'api'"
        :validate="validateApi"
        :validate-on="[]"
        :state="apiState"
        :loading-auto="true"
        class="space-y-4 flex flex-col items-center justify-center w-full"
        @submit.prevent="onApiSubmit"
      >
        <UFormField
          label="API Key"
          required
          name="api"
          class="w-full max-w-xs"
        >
          <template #help>
            <p class="text-neutral-500 text-xs">
              The API key from Jupiter
            </p>
          </template>
          <UInput
            v-model="apiState.api"
            placeholder="jup_..."
            icon="i-lucide-key"
            :type="showPassword ? 'text' : 'password'"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="xs"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          optional
          label="RPC URL"
          name="rpc"
          class="w-full max-w-xs"
        >
          <template #help>
            <p class="text-neutral-500 text-xs">
              The RPC provider URL. <br>
              Defaults to https://api.mainnet.solana.com
            </p>
          </template>
          <UInput
            v-model="apiState.rpc"
            placeholder="https://api.mainnet.solana.com"
            icon="i-lucide-cloud"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          class="w-fit"
          color="primary"
          :loading="loading"
        >
          Save
        </UButton>
      </UForm>
    </div>

    <template #footer>
      <!-- empty -->
    </template>
  </UCard>
</template>