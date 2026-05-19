/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Stats } from '@/types/VolumeBots';
import {ref} from 'vue';



export function useStaticVolumeStats() {
  const stats = ref<Stats>();
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  const getAll = async () => {
    loading.value = true;
    error.value = undefined;
    try {
        const res = await window.tradesApi.volumeBotStatus();
        if (!res) error.value = 'Error getting data';

        if (!res.ok) {
            error.value = res.reason;
            return;
        }

        stats.value = res.data;
        return res.data;
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
    stats,
    getAll
 };
}