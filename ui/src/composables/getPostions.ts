import type { Positions } from '@/types/positons';
import {ref} from 'vue';




export function useGetPostions() {
    const data = ref<Positions[] | undefined>();
    const error = ref();
    const loading = ref(false);


    const getAll = async () => {
        loading.value = true;
        error.value = '';

        try {
            const res = await window.tradesApi.getPositions();

            if (!res.ok) {
                error.value = res.reason;
                return;
            }
            
            const positions = res.data;
            data.value = positions;
            return positions;
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