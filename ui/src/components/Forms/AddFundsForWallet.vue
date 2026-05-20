<script setup lang="ts">
import { useDistributeFunds } from '@/composables/addFunds';
import type { WalletsManagementTable } from '@/types/GetWallets';
import { computed, ref } from 'vue';
import OffensiveSpinner from '../OffensiveSpinner.vue';

const toast = useToast();
const props = defineProps<{
  wallet: WalletsManagementTable | WalletsManagementTable[] | null
}>();

const model = defineModel<boolean>({
  default: false
});

const emit = defineEmits<(e: 'submitted') => void>();
const selectedWallets = computed(() => {
  if (props.wallet && !Array.isArray(props.wallet)) return [props.wallet.publickey];
  const mapped = props.wallet?.map(a => a.publickey) ?? [];
  return mapped;
});

const { execute, amountPerWallet, loadingForm, walletsLoading } = useDistributeFunds({
   selectedSpecific: ref(true),
   selectedWallets
 });

async function confirmAddFunds() {
  if (amountPerWallet.value <= 0) {
    toast.add({
        title: 'Error',
        color: 'error',
        duration: 10000,
        type: 'foreground',
        description: 'Amount needs to be greater then 0'
    });
    return;
  }
  try {
    await execute();
    emit('submitted');
  } finally {
      model.value = false;
  }
}

</script>


<template>
  <UModal
    v-model:open="model"
    :title="Array.isArray(props.wallet) ? 'Add funds that will be added for each wallet' : 'Add funds'"
  >
    <template #body>
      <UInputNumber
        v-if="!loadingForm && !walletsLoading"
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
      <OffensiveSpinner v-if="loadingForm || walletsLoading" />
    </template>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="model = false"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="loadingForm || walletsLoading"
          @click="confirmAddFunds"
        >
          Confirm
        </UButton>
      </div>
    </template>
  </UModal>
</template>