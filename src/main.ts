#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';
import { storeMainWallet, createWallets, drainWallets, splitFounds, readAllWallets, readWalletView } from './commands/wallets.js';
import { createWallet, storeMain } from './lib/createWallet.js';
import { range } from '@riavzon/utils';
import { toNumb } from './utils/utils.js';
import { distributeGas } from './lib/split.js';
import { buy, massOut, sell } from './commands/operation.js';

const start = defineCommand({
  meta: {
    name: 'Solana Bots',
    description: 'Start the wizard',
  },
  subCommands: {
    main: storeMainWallet,
    create: createWallets,
    drain: drainWallets,
    split: splitFounds,
    'read-all': readAllWallets,
    read: readWalletView,
    buy,
    sell,
    out: massOut
  },

  async run() {
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

     await distributeGas(password, toNumb(fund));

     consola.success('Your all set!');
     consola.info('Try running buy --help, sell --help, out --help to understand how to start trading!');
     consola.info('Or run drain --help, split --help, read-all --help, read --help to understand how to manage your wallets!');
     consola.info('Full solana-bots --help menu');
     consola.box(`wallets.db is the database file that stores your wallets encrypted. DO NOT DELETE THIS FILE UNLESS YOU CERTAIN ALL FOUNDS ARE IN YOUR MAIN WALLET`);
     process.exit(0);
  }
});

await runMain(start);