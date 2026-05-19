#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';
import { storeMainWallet, createWallets, drainWallets, splitFounds, readAllWallets, readWalletView, apiAndRpc, getAirDropC } from './commands/wallets.js';
import { createWallet, storeMain } from './lib/createWallet.js';
import { range } from '@riavzon/utils';
import { toNumb, rpcAndAPI } from './utils/utils.js';
import { distributeGas } from './lib/split.js';
import { buy, massOut, sell } from './commands/operation.js';
import { volumeStart } from './lib/transactions/volumeBot/volumeStart.js';
import { volumeStop } from './lib/transactions/volumeBot/volumeStop.js';
import { volumeStatus } from './lib/transactions/volumeBot/volumeStatus.js';
import { volumeBot } from './lib/transactions/volumeBot/volumeBotWorker.js';

if (process.env['SOLANA_BOTS_INTERNAL'] === 'volume-worker') {
  try {
    await volumeBot(
      process.env['TARGET_MINT']!,
      Number(process.env['AMOUNT']),
      Number(process.env['WALLETS']),
      process.env['PASSWORD']!,
      Number(process.env['INTERVAL']),
      (process.env['MASS_OUT'] === 'true' ? true : false),
      process.env['TTL'] ? Number(process.env['TTL']) : undefined,
    );
  } catch (err) {
    consola.error(err);
    process.exitCode = 1;
  }
  process.exit(0);
}

const start = defineCommand({
  meta: {
    name: 'Solana Bots',
    description: 'Start the wizard',
  },
  subCommands: {
    main: storeMainWallet,
    create: createWallets,
    'api-rpc': apiAndRpc,
    drain: drainWallets,
    split: splitFounds,
    'read-all': readAllWallets,
    read: readWalletView,
    'volume-start': volumeStart,
    'volume-stop': volumeStop,
    'volume-status': volumeStatus,
    airdrop: getAirDropC,
    buy,
    sell,
    out: massOut
  },

  async run({args}) {
   // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
   if (args._ && args._.length > 0) {
        return; 
    }

     consola.box('Solana Bots - Starter');
     const password = await consola.prompt('First add your main wallet. This wallet will be used to distribute funds across, sub wallets, and drain them.', {
        type: 'text',
        placeholder: 'The password used to encrypt and decrypt your wallets',
        cancel: 'null'
     });

     if (password === null) {
          consola.fail('Password is required. Exiting....');
          process.exit(1); 
     }

    const path = await consola.prompt('Provide the file path containing your private wallet key', {
        type: 'text',
        cancel: 'null'
     });

    if (path === null) {
          consola.fail('private wallet key is required. Exiting....');
          process.exit(1); 
     }

     await storeMain(password, path);

     const api = await consola.prompt(`Provide your Jupiter api key (will be encrypted):`, {
          type: 'text',
          cancel: 'null'
     });

     if (api === null) {
          consola.fail('Existing...');
          process.exit(1); 
     }

      const rpc = await consola.prompt(`Provide the rpc you want to use. default to https://api.mainnet.solana.com:`, {
          type: 'text',
          placeholder: 'https://api.mainnet.solana.com',
          default: 'https://api.mainnet.solana.com',
          cancel: 'null'
     });

     if (rpc === null) {
          consola.fail('Existing...');
          process.exit(1); 
     }

     await rpcAndAPI(api, rpc, password);
     
     const createBots = await consola.prompt('Now lets created some sub wallets. Enter the number of sub wallets you want to create', {
        type: 'text',
        placeholder: '5',
        cancel: 'null'
     });

     let numbOfWall = 5;

    if (createBots !== null) {
        numbOfWall = toNumb(createBots);

        for (const {} of range(0, numbOfWall)) {
            consola.start('Creating wallets...');
            await createWallet(password);
            consola.success('Wallets created!');
        }
        } else {
            const confirm = await consola.prompt('Value doesnt provided. use default? (5)', {
              type: 'confirm',
              initial: true,
              cancel: 'reject'
            });
  
            if (confirm) {
              for (const {} of range(0, numbOfWall)) {
                  consola.start('Creating wallets...');
                  await createWallet(password);
                  consola.success('Wallets created!');
              }
            } else {
                consola.fail('Existing...');
                process.exit(1); 
        }
     }

    const fund = await consola.prompt('You almost ready! Now lets give some funds for your new wallets. Provide the number of SOL you want to add for each of your new wallet, from your main one', {
        type: 'text',
        placeholder: '2',
        cancel: 'null'
     });

    if (fund === null) {
          consola.fail('Please add provide a value');
          process.exit(1); 
     }

     await distributeGas(password, parseFloat(fund));

     consola.success('Your all set!');
     consola.info('Try running buy --help, sell --help, out --help to understand how to start trading!');
     consola.info('Or run drain --help, split --help, read-all --help, read --help to understand how to manage your wallets!');
     consola.info('Full solana-bots --help menu');
     consola.box(`wallets.db is the database file that stores your wallets encrypted. DO NOT DELETE THIS FILE UNLESS YOU CERTAIN ALL FOUNDS ARE IN YOUR MAIN WALLET`);
     process.exit(0);
  }
});


await runMain(start);