<script setup lang="ts">
import { useRandomQuote } from '@/composables/randomQuetes';
import { reactive, ref } from 'vue';

const showPassowrd = ref(false);
const state = reactive({
  password: ''
});
const pepe = new URL('../../assets/public/passwordSaved.jpeg', import.meta.url).href;
const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;

const validate = (states: Partial<typeof state>) => {
    const errors = [];
    if (!states.password) errors.push({ name: 'password', message: 'Password is required' });
    if (state.password && state.password.length < 8) {
        if (!state.password) errors.push({ name: 'password', message: 'Password needs to be minimum of 8 characters long' });
    }
    return errors;
};


const loading = ref(false);
const success = ref();
const toast = useToast();
const smartQuote = useRandomQuote();

const onSubmit = async () => {
    loading.value = true;
    try {
        const api = await window.password.savePassword(state.password);
        if (api.ok) {
            toast.add({
                title: 'Success',
                description: smartQuote,
                color: 'success',
                type: 'foreground',
                duration: 8000,
                avatar: {src: smartPepe},
                close: {
                    color: 'primary',
                    variant: 'outline',
                    class: 'rounded-full'
                }
            });
            success.value = true;
            return;
        } else {
                toast.add({
                title: 'Error',
                description: api.reason,
                color: 'error',
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
  <div 
    class="flex flex-col items-center justify-center gap-4 m-auto mt-5 w-full"
  >
    <UPageCard 
      v-if="!success"
      class="w-full max-w-5xl"
      variant="outline"
      :ui="{
        wrapper: 'flex flex-col flex-1 items-center justify-center',
      }"
    >
      <template
        #header
      >
        <div class="mx-auto flex w-fit flex-col items-center justify-center gap-4 text-center">
          <UIcon
            name="i-lucide-lock"
            class="size-10"
          />

          <h2>
            Password
          </h2>

          Add your password to start trading
        </div>
      </template>
      <UForm
        :validate="validate"
        :validate-on="[]"
        :state="state"
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
              Use the exact password you used when started
            </p>
          </template>
          <UInput
            v-model="state.password"
            placeholder="password..."
            icon="i-lucide-lock"
            :type="showPassowrd ? 'text' : 'password'"
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          class="w-fit"
          :loading="loading"
        >
          Submit
        </UButton>
      </UForm>
    </UPageCard>

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
          Good. Now go make money
        </h1>
      </template>
      <img
        :src="pepe"
        class="w-full"
      >
    </UPageCard>
  </div>
</template>