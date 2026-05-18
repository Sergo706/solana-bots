import { ref } from 'vue';
import { useRandomQuote } from './randomQuetes';

export function useCreateWallets(initialCount = 1) {
  const count = ref(initialCount);
  const error = ref<string | undefined>();
  const successResponse = ref<string | null>(null);
  const success = ref(false);
  const loadingForm = ref(false);

  const toast = useToast();
  const smartPepe = new URL('../../assets/public/smartpepe.jpg', import.meta.url).href;
  const smartQuote = useRandomQuote();

  const create = async () => {
    loadingForm.value = true;
    error.value = undefined;
    try {
      const res = await window.walletsApi.createWallet(count.value);

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
      const api = await create();
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

    if (!count.value || count.value <= 0) {
      errors.push({ name: 'count', message: 'Must create at least 1 wallet' });
    }

    return errors;
  }

  const resetResult = () => {
    success.value = false;
    successResponse.value = null;
    error.value = undefined;
  };

  return {
    count,

    error,
    successResponse,
    success,
    loadingForm,

    validate,
    resetResult,
    create,
    execute
  };
}