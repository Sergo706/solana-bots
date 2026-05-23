<!-- eslint-disable @typescript-eslint/restrict-template-expressions -->
<script setup lang="ts">
import OffensiveSpinner from '../OffensiveSpinner.vue';
import { useRandomQuote } from '@/composables/randomQuetes';
import { useVolumeBots } from '@/composables/useVolumeBot';

const {
 targetMintAddress,
 interval,
 ttl,
 numberOfWallets,
 maxSolPerWallet,
 shouldMassOutOnStop,


  validate,
  submit,
  loadingForm,
  success,
  successResponse
} = useVolumeBots();

const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
const smartQuote = useRandomQuote();

const emit = defineEmits<(e: 'submitted') => void>();
const toast = useToast();


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
    v-if="(!loadingForm) && !success"
    :validate="validate"
    :validate-on="[]"
    :state="{ targetMintAddress, numberOfWallets, ttl, interval, maxSolPerWallet, shouldMassOutOnStop }"
    :loading-auto="true"
    class="space-y-4 flex flex-col items-center justify-center w-full"
    @submit.prevent="onSubmit"
  >
    <UFormField
      label="Target mint"
      required
      name="targetMintAddress"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The token mint address you want to target
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
      optional
      label="Interval" 
      name="interval"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Specify the a wait period in seconds the bot will wait before running each cycle.
        </p>
      </template>
      <UInputNumber
        v-model="interval"
        :min="0"
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

    <UFormField
      optional
      label="Expiry" 
      name="ttl"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          Specify the time in seconds the bot will automatically stop its executions
        </p>
      </template>
      <UInputNumber
        v-model="ttl"
        :min="0"
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
    
    <UFormField
      required
      name="numberOfWallets"
      class="w-full max-w-xs"
    > 
      <template #help>
        <p class="text-neutral-500 text-xs">
          Select the count of wallets you want to use in this launch
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
      required
      label="SOL Amount" 
      name="maxSolPerWallet"
      class="w-full max-w-xs"
    >
      <template #help>
        <p class="text-neutral-500 text-xs">
          The Maximum Amount of SOL to use from <b>EACH</b> wallet.
        </p>
      </template>
      <UInputNumber
        v-model="maxSolPerWallet"
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
      required
      name="massout"
      class="w-full max-w-xs"
    > 
      <UCheckbox
        v-model="shouldMassOutOnStop"
        :default-value="true"
        indicator="end"
        variant="card"
        label="Mass out"
        description="Mark this to get out on all open positions when the bot finishes"
      />
      <template #help>
        <p class="text-neutral-500 text-xs">
          Stopping the volume bot mid-run will <b>NOT</b> automatically exit your open positions. 
          Think of the Stop button as a kill switch: it instantly prevents the bot from making any further moves, including massing out. <br>
          Make sure you properly configure the run timer and the maximum amount of SOL to use from <b>EACH</b> wallet, 
          or simply navigate to the 'Trade' tab and click 'Mass Out' if you choose to stop the bot manually.
        </p>
      </template>
    </UFormField>
    

    <UButton
      type="submit"
      class="w-fit"
      :loading="loadingForm"
    >
      Launch Bot
    </UButton>
  </UForm>


  <OffensiveSpinner v-else-if="loadingForm && !success" />

  <div
    v-if="success && successResponse"
    class="w-full max-w-md mx-auto p-2"
  >
    <UAlert
      color="success"
      variant="subtle"
      title="Success!"
      description="Successfully launched the bot. "
      icon="i-lucide-circle-check" 
    />
  </div>
</template>