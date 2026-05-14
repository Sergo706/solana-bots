import '../assets/css/index.css';
import { createApp } from 'vue';
import ui from '@nuxt/ui/vue-plugin';
import App from '../App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import AIView from '@/views/AIView.vue';
import SettingsView from '@/views/SettingsView.vue';
import VolumeBotView from '@/views/VolumeBotView.vue';
import TradeView from '@/views/TradeView.vue';
import WalleltsView from '@/views/WalleltsView.vue';



const app = createApp(App);

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/ai', component: AIView },
    { path: '/trade', component: TradeView },
    { path: '/wallets', component: WalleltsView },
    { path: '/volume-bot', component: VolumeBotView },
    { path: '/settings', component: SettingsView },
  ], 
});

app.use(router);
app.use(ui);
app.mount('#app');