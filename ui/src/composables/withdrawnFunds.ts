import { computed, ref } from 'vue';
import { useRawWallets } from '@/composables/getAllRawWallets';
import { useRandomQuote } from './randomQuetes';
import { useOrCreateRef, type MaybeRef } from '@/utils/useOrCreateRef';
import { useStorage } from '@vueuse/core';


interface UseDrainFundsOptions {
  fee?: MaybeRef<number | undefined>;
  selectedSpecific?: MaybeRef<boolean>;
  selectedWallets?: MaybeRef<string[] | undefined>;
}

export function useDrainFunds(options: UseDrainFundsOptions = {}) {
  const fee = useOrCreateRef(options.fee, undefined);
  const selectedSpecific = useOrCreateRef(options.selectedSpecific, false);
  const selectedWallets = useOrCreateRef(options.selectedWallets, []);
  const dontShowAgainWarning = useStorage('dont-show-warning-wallets', false, localStorage, {mergeDefaults: true});

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
    if (!selectedSpecific.value) {
      return undefined;
    }

    const sel = selectedWallets.value;
    if (!sel || sel.length === 0) {
      return undefined;
    }

    const output: { publicAddress: string; id: number }[] = [];

    for (const wal of sel) {
      const current = walletsData.value?.subKeys.find((k) => String(k.pubkey) === wal);
      if (current?.meta.id !== undefined) {
        output.push({
          publicAddress: String(current.pubkey),
          id: current.meta.id
        });
      }
    }

    return output;
  });

  const error = ref<string | undefined>();
  const successResponse = ref<string | null>(null);
  const success = ref(false);
  const loadingForm = ref(false);

  const submit = async () => {
    loadingForm.value = true;
    error.value = undefined;

    try {
      const payloadWallets = targetedWalletsPayload.value && targetedWalletsPayload.value.length > 0
        ? targetedWalletsPayload.value
        : undefined;

      const res = await window.walletsApi.drainWalletsToMain(
        payloadWallets,
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

    if (fee.value !== undefined && fee.value < 0) {
      errors.push({ name: 'fee', message: 'Fee cannot be negative' });
    }

    const sel = selectedWallets.value;
    if (selectedSpecific.value && (!sel || sel.length === 0)) {
      errors.push({ name: 'chosenWallets', message: 'Please select at least one wallet to drain' });
    }

    return errors;
  }

  const resetResult = () => {
    success.value = false;
    successResponse.value = null;
    error.value = undefined;
  };

  return {
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
    dontShowAgainWarning,
    
    resetResult,
    validate,
    execute,
    submit
  };
}