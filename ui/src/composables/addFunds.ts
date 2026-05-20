import { computed, ref } from 'vue';
import { useRawWallets } from '@/composables/getAllRawWallets';
import { useRandomQuote } from './randomQuetes';
import { useOrCreateRef, type MaybeRef } from '@/utils/useOrCreateRef';

interface UseDistributeFundsOptions {
  amountPerWallet?: MaybeRef<number>;
  fee?: MaybeRef<number | undefined>;

  selectedSpecific?: MaybeRef<boolean>;
  selectedWallets?: MaybeRef<string[]>;
}

export function useDistributeFunds(options: UseDistributeFundsOptions = {}) {
  const amountPerWallet = useOrCreateRef(options.amountPerWallet, 0);
  const fee = useOrCreateRef(options.fee, undefined);
  const selectedSpecific = useOrCreateRef(options.selectedSpecific, false);
  const selectedWallets = useOrCreateRef(options.selectedWallets, []);

  const toast = useToast();
  const smartPepe = new URL('../assets/public/smartpepe.jpg', import.meta.url).href;
  const smartQuote = useRandomQuote();


  const { error: walletsError, data: walletsData, getAll, loading: walletsLoading } = useRawWallets();


  const wallets = computed(() =>
    walletsData.value?.subKeys.map((d) => ({
      label: `${String(d.pubkey).slice(0, 4)}...${String(d.pubkey).slice(-4)}`,
      value: String(d.pubkey)
    })) ?? []
  );


  const targetedWalletsPayload = computed(() => {
    if (!selectedSpecific.value || selectedWallets.value.length === 0) {
      return undefined;
    }
    return selectedWallets.value.map((pubkey) => ({
      publicAddress: pubkey
    }));
  });

  const error = ref<string | undefined>();
  const successResponse = ref<{sent: string, lastSignature: string} | null>(null); 
  const success = ref(false);
  const loadingForm = ref(false);

  const submit = async () => {
    loadingForm.value = true;
    error.value = undefined;

    try {
      const res = await window.walletsApi.distributeFunds(
        amountPerWallet.value,
        targetedWalletsPayload.value,
        fee.value
      );

      if (!res.ok) {
        error.value = res.reason;
        success.value = false;
      } else {
        successResponse.value = res.data;
        success.value = true;
      }
      return res;
    } finally {
      loadingForm.value = false;
    }
  };

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
          avatar: { src: smartPepe }
        });
      } else {
        toast.add({
          title: 'Error',
          description: api.reason,
          color: 'error',
          duration: 12000
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.add({
        title: 'Critical Error',
        description: message,
        color: 'error'
      });
    }
  };

  function validate() {
    const errors: { name: string; message: string }[] = [];

    if (!amountPerWallet.value || amountPerWallet.value <= 0) {
      errors.push({ name: 'amountPerWallet', message: 'Amount needs to be greater than 0' });
    }

    if (fee.value !== undefined && fee.value < 0) {
      errors.push({ name: 'fee', message: 'Fee cannot be negative' });
    }

    if (selectedSpecific.value && selectedWallets.value.length === 0) {
      errors.push({ name: 'chosenWallets', message: 'Please select at least one wallet to receive funds' });
    }

    return errors;
  }

  const resetResult = () => {
    success.value = false;
    successResponse.value = null;
    error.value = undefined;
  };

  return {
    amountPerWallet,
    fee,
    selectedSpecific,
    selectedWallets,
    
    wallets,
    getAll,
    walletsLoading,
    walletsError,


    error,
    successResponse,
    loadingForm,
    success,


    resetResult,
    validate,
    execute,
    submit
  };
}