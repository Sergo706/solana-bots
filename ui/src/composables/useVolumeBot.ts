import { useOrCreateRef, type MaybeRef } from "@/utils/useOrCreateRef";
import type { Results } from "@riavzon/utils";
import { ref } from "vue";
import { useRandomQuote } from "./randomQuetes";

interface UseVolumeBotsOptions {
  targetMintAddress?: MaybeRef<string>
  maxSolPerWallet?: MaybeRef<number>
  numberOfWallets?: MaybeRef<number>
  interval?: MaybeRef<number>
  shouldMassOutOnStop?: MaybeRef<boolean>
  ttl?: MaybeRef<number>
}

export function useVolumeBots(options: UseVolumeBotsOptions = {}) {
    const targetMintAddress = useOrCreateRef(options.targetMintAddress, '');
    const maxSolPerWallet = useOrCreateRef(options.maxSolPerWallet, 0);
    const numberOfWallets = useOrCreateRef(options.numberOfWallets, 0);
    const interval = useOrCreateRef(options.interval, 0);
    const shouldMassOutOnStop = useOrCreateRef(options.shouldMassOutOnStop, true);
    const ttl = useOrCreateRef(options.ttl, 120);


    const toast = useToast();
    const smartPepe = new URL('../assets/public/smartpepe.jpg', import.meta.url).href;
    const smartQuote = useRandomQuote();

  function validate() {
    const errors: { name: string; message: string }[] = [];

    if (!targetMintAddress.value) {
      errors.push({ name: 'targetMintAddress', message: 'Please provide a mint to sell' });
    }

    if (maxSolPerWallet.value <= 0) {
      errors.push({ name: 'maxSolPerWallet', message: 'Max amount to use needs to be greater than 0' });
    }

    if (numberOfWallets.value <= 0) {
      errors.push({ name: 'numberOfWallets', message: 'Please use at least one wallet' });
    }

    if (ttl.value === 0) {
        errors.push({ name: 'ttl', message: 'Please provide how much time to run the bot in seconds' });
    }

    return errors;
  }

  const loadingForm = ref(false);
  const success = ref(false);
  const successResponse = ref<Results | null>(null);

  async function submit() {
    loadingForm.value = true;

    try {
      const api = await window.tradesApi.volumeBot(
        targetMintAddress.value,
        maxSolPerWallet.value,
        numberOfWallets.value,
        interval.value * 1000,
        shouldMassOutOnStop.value,
        ttl.value
      );

      if (api.ok) {
            success.value = true;
            successResponse.value = api.data as unknown as Results;
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

  const loadingStop = ref(false);
  const successStop = ref(false);
  const successResponseStop = ref<Results | null>(null);

  const stopVolumeBot = async () => {
    loadingForm.value = true;

    try {   
        const api = await window.tradesApi.volumeBotStop();

        if (api.ok) {
            successStop.value = true;
            successResponseStop.value = api.data as unknown as Results;
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
    }  catch(err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.add({
            title: 'Critical Error',
            description: message,
            color: 'error',
         });
     } finally {
        loadingStop.value = false;
     }

  };


  return {
    stopVolumeBot,
    resetResult,
    submit,
    execute,
    validate,
    

    loadingForm,
    success,
    successResponse,

    loadingStop,
    successResponseStop,
    successStop,

    targetMintAddress,
    interval,
    ttl,
    numberOfWallets,
    maxSolPerWallet,
    shouldMassOutOnStop
  };
}
