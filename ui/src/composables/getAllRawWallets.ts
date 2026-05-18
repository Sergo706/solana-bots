import type { GetRawWallets } from '@/types/GetWallets';
import {ref} from 'vue';




export function useRawWallets() {
    const data = ref<GetRawWallets | undefined>();
    const error = ref();
    const loading = ref(false);


    const getAll = async () => {
        loading.value = true;
        error.value = '';

        try {
            const res = await window.walletsApi.getAllRawWallets();

            if (!res.ok) {
                error.value = res.reason;
                return;
            }
            
            const wallets = res.data;
            data.value = wallets;
            return wallets;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            error.value = message;
            return;
        } finally {
            loading.value = false;
        }
    };

    return {
        error,
        data,
        loading,
        getAll
    };
}