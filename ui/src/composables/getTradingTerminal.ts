import {ref} from 'vue';
import type { TradingTerminalData } from '@/types/TradingTerminal';


export function useTradingView() {
    const data = ref<TradingTerminalData[]>();
    const error = ref();
    const loading = ref(false);

    const getAll = async () => {
        try {

            loading.value = true;
            error.value = '';
            const res = await window.tradesApi.getPositionsView();
            
            if (!res.ok) {
                error.value = res.reason;
                return;
            }
            
            const datas = res.data;
            data.value = datas;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return datas;

        }  catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            error.value = message;
            return;
        } finally {
            loading.value = false;
        }
    };  

    return {
        data,
        error,
        loading,
        getAll
    };
}