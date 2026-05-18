import {ref} from 'vue';
import type { WalletsManagementTable } from '@/types/GetWallets';


export function useGetWalletsManagement() {
    const data = ref<WalletsManagementTable[]>();
    const error = ref();
    const loading = ref(false);

    const getAll = async () => {
        try {

            loading.value = true;
            error.value = '';
            const res = await window.walletsApi.getWalletsManagementView();
            
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