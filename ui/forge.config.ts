import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import path from 'node:path';

const currentDir = import.meta.dirname;
const migrationDir = path.join(currentDir, '..', 'src', 'db', 'migrations')

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Solana Bots',
    asar: true,
    ignore: [
        /node_modules\/(?!(better-sqlite3|bindings|file-uri-to-path)\/)/,
        /^\/src($|\/)/,
        /^\/\.gitignore$/,
        /^\/\.eslintignore$/,
        /\.d\.ts$/,
        /^\/tsconfig\.json$/,
        /^\/eslint\.config\.mjs$/,
        /^\/forge\.config\.ts$/,
        /^\/vite\..*\.config\.ts$/,
    ],
    appCategoryType: 'Productivity',
    overwrite: true, 
    appVersion: '1.0.6',
    appCopyright: 'Solana bots https://riavzon.com - All right reserved',
    darwinDarkModeSupport: true,
    executableName: 'solana-bots',
    extraResource: [
        migrationDir
    ],
    icon: './build/icons/icon'
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        homepage: 'https://riavzon.com',
        genericName: 'Trading bot',
        icon: './build/icons/256x256.png',
        description: 'Solana Trading Terminal and Bot Manager',
        categories: ['Utility', 'Network'],
        productName: 'Solana bots',
        productDescription: 'A professional-grade Solana trading terminal and automation suite designed for high-frequency volume generation and strategic asset management. Solana Bots empowers users to execute complex trading strategies across multiple sub-wallets simultaneously, featuring a powerful Volume Bot for automated buy/sell cycles, mass-operation tools for instant position closing , and a comprehensive wallet management system.'
      }
    }),

    new MakerDeb({
      options: {
        maintainer: 'Sergey Riavzon - https://riavzon.com',
        genericName: 'Trading bot',
        homepage: 'https://riavzon.com',
        description: 'Solana Trading Terminal and Bot Manager',
        icon: './build/icons/256x256.png', 
        categories: ['Utility', 'Network'], 
        productName: 'Solana bots',
        productDescription: 'A professional-grade Solana trading terminal and automation suite designed for high-frequency volume generation and strategic asset management. Solana Bots empowers users to execute complex trading strategies across multiple sub-wallets simultaneously, featuring a powerful Volume Bot for automated buy/sell cycles, mass-operation tools for instant position closing , and a comprehensive wallet management system.'
      }
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/electron/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/electron/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        }
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
