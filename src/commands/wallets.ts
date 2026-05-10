import { defineCommand } from "citty";
import { storeMain, createWallet } from "../lib/createWallet.js";
import consola from "consola";
import { range } from "@riavzon/utils";
import { drainWalletsToMain } from "../lib/drainWallets.js";
import { distributeGas } from "../lib/split.js";
import { getAllWalletsView, getByPubkey } from "../lib/reads.js";
import { rpcAndAPI, toNumb } from "../utils/utils.js";

export const storeMainWallet = defineCommand({
    meta: {
        name: 'Main wallet',
        description: `Configure the main wallet, to generate new ones, drain to the main, and distribute founds across the newly generated one. You can have only one main wallet at the time`
    },

    args: {
        password: {type: 'string', description: 'The password that will be used for encryption and decryption', required: true, valueHint: "mySecurePassword" },
        pathToPrivateKey: {type: 'string', description: 'The path to the file containing the PrivateKey of your wallet', required: true, valueHint: './path/to/file'}
    },

    async run({args}) {
       consola.start('Storing main wallet...');
       await storeMain(args.password, args.pathToPrivateKey);
    }
});

export const apiAndRpc = defineCommand({
    meta: {
        name: 'Jupiter api & RPC config',
        description: `Configure the Jupiter api key, and the rpc to use.`
    },

    args: {
        password: {type: 'string', description: 'The password that will be used for encryption and decryption (should be the same as for the main wallet)', required: true, valueHint: "mySecurePassword" },
        rpc: {type: 'string', description: 'The rpc url', required: false, default: 'https://api.mainnet.solana.com'},
        api: {type: 'string', description: 'The API key to use', required: true },
    },

    async run({args}) {
       consola.start('Storing main api and rpc...');
       await rpcAndAPI(args.api, args.rpc, args.password);
    }
});

export const createWallets = defineCommand({
    meta: {
        name: 'Create Wallets',
        description: `Create and store the wallets to be used across mass buying selling etc`
    },

    args: {
        password: {type: 'string', description: 'The password that will be used for encryption and decryption (should be the same as for the main wallet)', required: true, valueHint: "mySecurePassword" },
        count: {type: 'string', description: 'The number of wallets to create', required: false, default: '1', valueHint: '1'}
    },

    async run({args}) {
       consola.start(`Creating ${args.count} wallets...`);
       const num = toNumb(args.count);

       for (const {} of range(0, num)) {
           await createWallet(args.password);
       }

       consola.success(`All ${args.count} wallets created successfully!`);

    }
});

export const drainWallets = defineCommand({
    meta: {
        name: 'Drain wallets',
        description: `Drain all the sub wallets you created into the main wallets you stored`
    },

    args: {
        password: {type: 'string', description: 'The password that you used to create sub wallets and store the main wallet', required: true, valueHint: "mySecurePassword" },
        fee: {type: 'string', description: 'Adjust the fee to be required in lamports', required: false, default: '5000' }
    },

    async run({args}) {
       const num = toNumb(args.fee);
        await drainWalletsToMain(args.password, num);
    }

});

export const splitFounds = defineCommand({
    meta: {
        name: 'Distribute founds',
        description: `Distribute from your main wallet to your sub wallets`
    },

    args: {
        password: {type: 'string', description: 'The password that you used to create sub wallets and store the main wallet', required: true, valueHint: "mySecurePassword" },
        amount: {type: 'string', description: 'The total amount IN SOL that will be added for each wallet, taken from the main wallet', required: true, valueHint: '1' },
        fee: {type: 'string', description: 'Adjust the fee to be required in lamports', required: false, default: '5000' }
    },

    async run({args}) {
        const num = toNumb(args.amount);
        const fees = toNumb(args.fee);
        await distributeGas(args.password, num, fees);
    }
});


export const readAllWallets = defineCommand({
    meta: {
        name: 'Read All Wallets',
        description: `Read metadata of all your wallets. balance in SOL, pubkey, id, and createAt`
    },
    args: {
        password: {type: 'string', description: 'The password that you used to create sub wallets and store the main wallet', required: true, valueHint: "mySecurePassword" },
    },

    async run({args}) {
        await getAllWalletsView(args.password);
    }
});

export const readWalletView= defineCommand({
    meta: {
        name: 'Read Wallet',
        description: `Read metadata of a specific wallet with a pubkey. balance in SOL, pubkey, id, and createAt`
    },
    
    args: {
        password: {type: 'string', description: 'The password that you used to create sub wallets and store the main wallet', required: true, valueHint: "mySecurePassword" },
        pubkey: {type: 'string', description: 'The public key of your wallet.', required: true },
    },

    async run({args}) {
        await getByPubkey(args.password, args.pubkey);
    }
});