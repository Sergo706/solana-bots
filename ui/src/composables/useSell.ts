import { computed, ref } from 'vue';
import { useRawWallets } from '@/composables/getAllRawWallets';
import type { SerializedWallet } from '@/types/positons';
import type { SellResponseMain } from '@/types/TradesResponse';
import { useRandomQuote } from './randomQuetes';
import { useOrCreateRef, type MaybeRef } from '@/utils/useOrCreateRef';


interface UseMassSellOptions {
  targetMintAddress?: MaybeRef<string>
  numberOfWallets?: MaybeRef<number>
  sellPercentage?: MaybeRef<number>
  chunksToProcess?: MaybeRef<number>
  selectedSpecific?: MaybeRef<boolean>
  selectedWallets?: MaybeRef<string[]>
  targetedPositionsToSell?: MaybeRef<number[]>
}



export function useMassSell(options: UseMassSellOptions = {}) {
  const targetMintAddress = useOrCreateRef(options.targetMintAddress, '');
  const numberOfWallets = useOrCreateRef(options.numberOfWallets, 0);
  const sellPercentage = useOrCreateRef(options.sellPercentage, 100);
  const chunksToProcess = useOrCreateRef(options.chunksToProcess, 1);

  const selectedSpecific = useOrCreateRef(options.selectedSpecific, false);
  const selectedWallets = useOrCreateRef(options.selectedWallets, []);
  
  const targetedPositionsToSell = useOrCreateRef(options.targetedPositionsToSell, []);
  const toast = useToast();
  const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
  const smartQuote = useRandomQuote();

  const { error, data, getAll, loading } = useRawWallets();

  const wallets = computed(() =>
    data.value?.subKeys.map((d) => ({
      label: `${String(d.pubkey).slice(0, 4)}...${String(d.pubkey).slice(-4)}`,
      value: d.pubkey as unknown as string
    })) ?? []
  );

  const selectedSerializedWallets = computed<SerializedWallet[]>(() => {
    if (!selectedSpecific.value) {
      return [];
    }

    const output: SerializedWallet[] = [];

    for (const wal of selectedWallets.value) {
      const current = data.value?.subKeys.find((k) => String(k.pubkey) === wal);

      if (!current) {
        continue;
      }

      output.push({
        publicKey: String(current.pubkey),
        secretKey: current.decryptedPrivate
      });
    }

    return output;
  });
  
  function validate() {
    const errors: { name: string; message: string }[] = [];

    if (!targetMintAddress.value) {
      errors.push({ name: 'target', message: 'Please provide a mint to sell' });
    }

    if (sellPercentage.value <= 0 || sellPercentage.value > 100) {
      errors.push({ name: 'sellPercentage', message: 'Sell percentage must be between 1 and 100' });
    }

    if (!selectedSpecific.value && numberOfWallets.value <= 0) {
      errors.push({ name: 'numberOfWallets', message: 'Please use at least one wallet' });
    }

    if (selectedSpecific.value && selectedWallets.value.length === 0) {
      errors.push({ name: 'chosenWallets', message: 'Please select wallets to sell from' });
    }

    return errors;
  }

  const loadingForm = ref(false);
  const success = ref(false);
  const successResponse = ref<SellResponseMain | null>(null);

  async function submit() {
    loadingForm.value = true;

    try {
      const chosen = selectedSpecific.value && selectedSerializedWallets.value.length > 0
        ? selectedSerializedWallets.value
        : undefined;

      const api = await window.tradesApi.sell(
        targetMintAddress.value,
        numberOfWallets.value,
        sellPercentage.value,
        chunksToProcess.value,
        chosen,
        targetedPositionsToSell.value.length > 0 ? targetedPositionsToSell.value : undefined
      );

      if (api.ok) {
        success.value = true;
        successResponse.value = api.data;
      }

      return api;
    } finally {
      loadingForm.value = false;
    }
  }

const execute = async () => {
  try {
    const api = await submit();

    if (api.ok) {
      toast.add({
        title: 'Success',
        description: smartQuote,
        color: 'success',
        type: 'foreground',
        duration: 12000,
        avatar: { src: smartPepe },
      });
    } else {
      toast.add({
        title: 'Error',
        description: api.reason,
        color: 'error',
        duration: 12000,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    toast.add({
      title: 'Critical Error',
      description: message,
      color: 'error',
    });
  }
};
  function resetResult() {
    success.value = false;
    successResponse.value = null;
  }

  return {
    error,
    data,
    getAll,
    loading,
    wallets,

    targetMintAddress,
    numberOfWallets,
    sellPercentage,
    chunksToProcess,

    selectedSpecific,
    selectedWallets,
    
    targetedPositionsToSell,
    selectedSerializedWallets,

    validate,
    submit,
    execute,
    resetResult,

    loadingForm,
    success,
    successResponse
  };
}