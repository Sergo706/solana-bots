<script setup lang="ts">
import { reactive, ref } from 'vue';

const showPassowrd = ref(false);
const emit = defineEmits<(e: 'submitted') => void>();

const stepTwo = reactive({
  api: '',
  rpc: 'https://api.mainnet.solana.com'
});

const stepTwoValidate = (state: Partial<typeof stepTwo>) => {
    const errors = [];
    if (!state.api) errors.push({ name: 'password', message: 'Please provide your api key' });
    return errors;
};


const loading = ref(false);
const toast = useToast();


const onSubmit = async () => {
    loading.value = true;
    try {
        const api = await window.password.saveRpcAndAPi(stepTwo.api, stepTwo.rpc);
        if (api.ok) {
          emit('submitted');
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
    :validate="stepTwoValidate"
    :validate-on="[]"
    :state="stepTwo"
    :loading-auto="true"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="API Key"
      required
      name="api"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The API key from Jupiter (Will be encrypted)
        </p>
      </template>
      <UInput
        v-model="stepTwo.api"
        placeholder="jup_..."
        icon="i-lucide-key"
        :type="showPassowrd ? 'text' : 'password'"
        class="w-full"
      />
    </UFormField>

    <UFormField
      optional
      label="RPC URL"
      name="rpc"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The RPC provider url. <br>
          Defaults to https://api.mainnet.solana.com
        </p>
      </template>
      <UInput
        v-model="stepTwo.rpc"
        placeholder="https://api.mainnet.solana.com"
        icon="i-lucide-cloud"
        class="w-full"
      />
    </UFormField>

    <UButton
      type="submit"
      class="w-fit"
      :loading="loading"
    >
      Next
    </UButton>
  </UForm>
</template>