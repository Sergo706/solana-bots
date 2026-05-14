import { defineCommand } from "citty";
import { massBuy } from "../lib/transactions/massBuy.js";
import { toNumb } from "../utils/utils.js";
import consola from "consola";
import { massSell } from "../lib/transactions/massSell.js";
import { massOutForAllWallets } from "../lib/transactions/massOut.js";

export const buy = defineCommand({
 meta: {
        name: 'Buy',
        description: `Execute a mass buy of a specific SPL token across multiple sub-wallets.`
    },
    args: {
        password: {
            type: 'string', 
            description: 'The master password used to decrypt your stored sub-wallets.', 
            required: true, 
            valueHint: "mySecurePassword" 
        },
        target: {
            type: 'string', 
            description: 'The exact SPL token mint address to buy (Base58 string).', 
            required: true,
            valueHint: "EKpQGSJtjMFqKZ9KQanUKAbY..." 
        },
        wallets: {
            type: 'string',
            description: 'The number of sub-wallets to use for this mass buy.', 
            required: true,
            valueHint: "5"
        },
        amounts: {
            type: 'string', 
            description: 'The amount of SOL each individual wallet will spend (e.g., 0.1).', 
            required: true,
            valueHint: "0.1"
        },
    },

    async run({args}) {
        const numbWallets = toNumb(args.wallets);
        const amountsNumb = parseFloat(args.amounts);

        if (numbWallets <= 0 || amountsNumb <= 0) {
            consola.error("The 'wallets' argument must be a valid number greater than 0.");
            consola.error("The 'amounts' argument must be a valid number greater than 0.");
            process.exit(1);
        }
    try {
        await massBuy(args.target, amountsNumb, numbWallets, args.password);
    } catch(err) {
        consola.fail('Mass buy operation failed.', err);
        process.exit(1);
    }
    }
});


export const sell = defineCommand({
    meta: {
        name: 'Sell',
        description: `Execute a mass sell of a specific SPL token across multiple sub-wallets.`
    },
    args: {
        password: {
            type: 'string', 
            description: 'The master password used to decrypt your stored sub-wallets.', 
            required: true, 
            valueHint: "mySecurePassword" 
        },
        target: {
            type: 'string', 
            description: 'The exact SPL token mint address to sell (Base58 string).', 
            required: true,
            valueHint: "EKpQGSJtjMFqKZ9KQanUKAbY..." 
        },
        wallets: {
            type: 'string', 
            description: 'The number of sub-wallets to use for this mass sell.', 
            required: true,
            valueHint: "5"
        },
        percentage: {
            type: 'string', 
            description: 'The percentage of the token balance to sell (1-100). Default is 0 (sells 100% of the balance).', 
            required: false,
            default: "0",
            valueHint: "50"
        },
    },

    async run({ args }) {
        consola.start(`Initiating mass sell for token: ${args.target}...`);
        
        const numWallets = toNumb(args.wallets);
        const sellPct = toNumb(args.percentage);

        if (numWallets <= 0 || sellPct < 0 || sellPct > 100) {
            consola.error("The 'wallets' argument must be a valid number greater than 0.");
            consola.error("The 'percentage' argument must be a number between 0 and 100.");
            process.exit(1);
        }

        try {
            await massSell(args.target, numWallets, args.password, sellPct);
        } catch(err) {
            consola.fail('Mass sell operation failed.', err);
            process.exit(1);
        }
        consola.success('Mass sell operation completed.');
    }
});

export const massOut = defineCommand({
    meta: {
        name: 'Mass Out',
        description: `Liquidate ALL tokens across all sub-wallets back into SOL (Full Cleanup).`
    },

    args: {
        password: {
            type: 'string', 
            description: 'The master password used to decrypt your wallets.', 
            required: true, 
            valueHint: "mySecurePassword" 
        }
    },

    async run({ args }) {
        consola.warn('⚠️  MASS OUT INITIATED: This will sell every token in your sub-wallets for SOL.');
        try {
            await massOutForAllWallets(args.password);
        } catch(err) {
            consola.fail('Mass out operation failed.', err);
            process.exit(1);
        }
        consola.success('Mass Out operation completed. All wallets have been cleaned.');
    }
});