export default defineAppConfig({
  ui: {
    colors: {
      primary: 'accent',
      neutral: 'riavzon',
    },
    prose: {
      pre: {
        base: 'bg-transparent border-transparent' 
      },
      codeIcon: {
        sh: 'i-lucide-square-terminal'
      },
      codeGroup: {
        slots: {
          indicator: 'bg-cream-200/70 dark:bg-riavzon-800',
          trigger: 'hover:bg-cream-200/70 dark:hover:bg-riavzon-500'
        }
      },
    }
  },
  appName: 'Solana Bots',
  seo: {
    title: 'Solana Bots',
    description: 'A self-custodial CLI and desktop application for managing multiple Solana wallets and executing automated swaps.',
    url: 'https://solana.riavzon.com',
  },
  profile: {
    name: 'Solana Bots',
  },
});