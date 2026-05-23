const isDev = process.env.NODE_ENV === 'development'
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content', '@nuxt/image', '@nuxt/fonts', '@nuxt/hints', '@nuxtjs/seo', '@vueuse/nuxt', 'nuxt-feedme', 'nuxt-llms', '@nuxtjs/turnstile'],
  devtools: { enabled: true },
  
  css: [
    './app/assets/css/index.css'
  ],

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    provider: 'iconify',
  },

  routeRules: isDev
    ? {}
    : {
        '/blog/**': { prerender: true, cache: { maxAge: 60 * 60 * 24 * 30 } },
        '/': { prerender: true, cache: { maxAge: 60 * 60 * 24 * 30 } },
        '/api/*/**': { prerender: false, cors: true }
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/feed.xml', '/feed.atom', '/feed.json']
    },
    preset: "cloudflare-pages",
    cloudflare: {
      deployConfig: true,
      nodeCompat:true
    }
  },
  app: {
    head: {
      title: 'Solana Bots',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Solana Bots Blog RSS', href: '/feed.xml' },
        { rel: 'alternate', type: 'application/atom+xml', title: 'Solana Bots Blog Atom', href: '/feed.atom' },
      ],
      meta: [
        { name: 'theme-color', content: '#FFFDF7', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0A0908', media: '(prefers-color-scheme: dark)' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'charset', content: 'utf-8' },
        { name: 'color-scheme', content: 'light dark' },
      ]
    }
  },
  
  site: {
    url: 'https://solana.riavzon.com/',
    name: 'Solana Bots',
    description: 'A self-custodial CLI and desktop application for managing multiple Solana wallets and executing token swaps.',
    indexable: true,
    defaultLocale: 'en',
  },
    llms: {
    domain: 'https://solana.riavzon.com',
    title: 'Solana Bots',
    description: 'A self-custodial CLI and a desktop application for managing multiple Solana wallets and executing token swaps through the Jupiter aggregator.',
    sections: [
      {
        title: 'Core Interfaces',
        description: 'The app is split into two interfaces that share the same core libraries and read/write to a local SQLite database (wallets.db) managed by Drizzle ORM.\n\n1. CLI: A citty-based command-line tool compiled to standalone platform binaries. Runs headless, suitable for servers or scripting.\n2. Desktop App (UI): An Electron application with a Vue 3 + Tailwind CSS v4 renderer. Provides a visual trading terminal with real-time stats, activity feeds, and log streaming.'
      },
      {
        title: 'Key Features & Usage',
        description: 'Wallet Management: Import main wallet, generate N new sub-wallets, split SOL to sub-wallets, and drain all sub-wallet SOL back to the main wallet.\n\nTrading Operations: Mass buy or sell a token across N sub-wallets via Jupiter Swap API v2, and liquidate all token positions across all sub-wallets to SOL.\n\nVolume Bot: An automated bot that runs a continuous loop of buy-then-sell cycles against a target token mint. Cycles buy-sell pairs across configurable sub-wallets to generate trading volume.'
      },
      {
        title: 'Security & Architecture',
        description: 'All private keys and the Jupiter API key are encrypted (AES-256-GCM) before being written to the local SQLite database. The master password is never written to disk. The application operates entirely locally; no data leaves the machine unless explicitly submitted to an RPC endpoint.'
      },
      {
        title: 'Source Code & Downloads',
        description: 'The Solana Bots application is completely open-source and available to be installed on various platforms. You can review the source code on GitHub, or download the pre-compiled binaries and desktop installers directly via the endpoints below.',
        links: [
          {
            title: 'GitHub Repository',
            description: 'Access the complete source code, report issues, or contribute to the project.',
            href: 'https://github.com/Sergo706/solana-bots'
          },
          {
            title: 'Download CLI (Linux)',
            description: 'Standalone command-line binary for Linux distributions.',
            href: '/api/download/linux/cli'
          },
          {
            title: 'Download CLI (macOS)',
            description: 'Standalone command-line binary for macOS.',
            href: '/api/download/macos/cli'
          },
          {
            title: 'Download CLI (Windows)',
            description: 'Command-line executable installer for Windows.',
            href: '/api/download/windows/cli'
          },
          {
            title: 'Download Desktop App (Linux)',
            description: 'Desktop application packages for Linux (Debian/Ubuntu and Fedora).',
            href: '/api/download/linux/desktop'
          },
          {
            title: 'Download Desktop App (Windows)',
            description: 'Desktop application installer for Windows.',
            href: '/api/download/windows/desktop'
          }
        ]
      }
    ],
    notes: [
      'CAUTION: wallets.db contains encrypted private keys. Do not delete this file unless all funds have been moved to your main wallet.',
      'This project uses the Jupiter Swap API v2 for all transactions.'
    ],
    full: {
      title: 'Solana Bots Full Documentation',
      description: 'Comprehensive technical overview of the Solana Bots CLI and Desktop applications, including wallet management, the volume bot, and security practices.'
    }
  },
  compatibilityDate: '2024-04-03',

  ogImage: {
    zeroRuntime: true,
    componentDirs: ['app/components/OgImage']
  },
    sitemap: {
    zeroRuntime: true,
    defaults: {
      lastmod: new Date().toISOString(),
    }
  },
  feedme: {
    defaults: {
      common: false,
    },
    feeds: {
      common: {
        feed: {
          title: 'Solana bots Blog',
          description: 'Latest articles and updates from the Solana bots',
          id: 'https://solana.riavzon.com/',
          link: 'https://solana.riavzon.com/',
          language: 'en',
          favicon: 'https://solana.riavzon.com/favicon.ico',
          copyright: `© ${new Date().getFullYear()} Solana bots`,
          author: {
            name: 'Solana bots',
            link: 'https://solana.riavzon.com',
          },
        },
        revisit: '6h',
        fixDateFields: true,
        templateMapping: ['', 'meta', 'meta.feedme'],
        mapping: [['link', 'path']],
        charset: 'utf-8',
        collections: ['blog'],
      },
      routes: {
        '/feed.atom': { type: 'atom1' },
        '/feed.json': { type: 'json1' },
        '/feed.xml': { type: 'rss2' },
      }
    },
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'light-plus',
            light: 'light-plus',
            dark: 'dracula'
          },
          langs: ["bash"]
        },
        
      }
    }
  }
})