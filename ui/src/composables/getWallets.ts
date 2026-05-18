/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { GetWallets } from '@/types/GetWallets';
import {ref} from 'vue';



export function useGetWallets() {
  const wallets = ref<GetWallets>();
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  const getAll = async () => {
    loading.value = true;
    error.value = undefined;
    try {
        const wall = await window.walletsApi.getWallets();
        if (!wall) error.value = 'Error getting data';

        if (!wall.ok) {
            error.value = wall.reason;
            return;
        }

        wallets.value = wall.data;
        return wall.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        error.value = message;
        return;
    } finally {
        loading.value = false;
    }
  };

 return {
    loading,
    error,
    wallets,
    getAll
 };
}