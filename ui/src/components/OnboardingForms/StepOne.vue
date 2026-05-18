<script setup lang="ts">
import { reactive, ref } from 'vue';


const emit = defineEmits<(e: 'submitted') => void>();

const showPassowrd = ref(false);
const stepOne = reactive({
  password: '',
  pathToMainWallet: ''
});

const stepOneValidate = (state: Partial<typeof stepOne>) => {
            const errors = [];
            if (!state.password) errors.push({ name: 'password', message: 'Password is required' });
            if (!state.pathToMainWallet) errors.push({ name: 'pathToMainWallet', message: `Provide the full absolute path to your wallet's private key` });

            if (state.password && state.password.length < 8) {
                 if (!state.password) errors.push({ name: 'password', message: 'Password needs to be minimum of 8 characters long' });
            }
            return errors;
        };


const loading = ref(false);
const toast = useToast();


const onSubmit = async () => {
    loading.value = true;
    try {
        const api = await window.password.savePassword(stepOne.password);
        const saveWallet = await window.walletsApi.storeMainWallet(stepOne.pathToMainWallet);

        if (api.ok && saveWallet.ok) {
          emit('submitted');
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
          } else if (!saveWallet.ok) {
            toast.add({
              title: 'Error',
              description: saveWallet.reason,
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
    :validate="stepOneValidate"
    :validate-on="[]"
    :state="stepOne"
    :loading-auto="true"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Password"
      required
      name="password"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          This password will be used to encrypt/decrypt your wallets and api keys. it can't be recovered loosing it, means access to all your wallets and keys will be gone.
        </p>
      </template>
      <UInput
        v-model="stepOne.password"
        placeholder="password..."
        icon="i-lucide-lock"
        :type="showPassowrd ? 'text' : 'password'"
        class="w-full"
      />
    </UFormField>

    <UFormField
      required
      label="Path to Main Wallet"
      name="pathToMainWallet"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Provide the absolute path to the file containing the private key of your file
        </p>
      </template>
      <UInput
        v-model="stepOne.pathToMainWallet"
        placeholder="C://key.txt..."
        icon="i-lucide-file-text"
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