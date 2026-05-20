import { ref } from 'vue';
import type { SellResponseMain } from '@/types/TradesResponse';
import { useStorage } from '@vueuse/core';
import { useRandomQuote } from './randomQuetes';

export interface SubmitResult {
  ok: boolean;
  date: string;
  data?: SellResponseMain;
  reason?: string;
}

export function useMassOut() {
  const loadingForm = ref(false);
  const error = ref<string | undefined>(undefined);
  const success = ref(false);
  const successResponse = ref<SellResponseMain | null>(null);
  const dontShowAgainWarning = useStorage('dont-show-warning', false, localStorage, {mergeDefaults: true});
  const smartPepe = new URL('../assets/public/smartpepe.jpg', import.meta.url).href;
  const smartQuote = useRandomQuote();
  const toast = useToast();

  async function submit(): Promise<SubmitResult> {
    loadingForm.value = true;
    error.value = undefined;

    try {
      const api = await window.tradesApi.out();

      if (api.ok) {
        success.value = true;
        successResponse.value = api.data;
      } else {
        error.value = api.reason || 'Failed to execute mass out';
      }

      return api;
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      error.value = message;
      
      return { 
        ok: false, 
        reason: message, 
        date: new Date().toISOString() 
      };
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
        description: api.reason ?? 'The main process returned an error.',
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
    error.value = undefined;
  }

  return {
    loadingForm,
    error,
    success,
    successResponse,
    dontShowAgainWarning,
    
    execute,
    submit,
    resetResult
  };
}