import type { SellResponseMain } from "@/types/TradesResponse";
import SummryModal from '@/components/Modals/SummryModal.vue';


export const successModal = async (sum: SellResponseMain) => {
     const overlay = useOverlay();
     const modal = overlay.create(SummryModal);
     const instance = modal.open({
           title: 'Sell Summary',
           msg: 'Summary of this run',
           sell: sum 
       });
     await instance.result;
     return;
 };