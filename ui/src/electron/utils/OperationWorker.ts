/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { WorkerRequest } from '@/types/OperationWorker';
import { getAllWalletsView, getByPubkey } from '@solana-bots/lib/reads';
import { getWalletsManagementView } from './getWalletManagmentView';
import { createWallet, storeMain } from '@solana-bots/lib/createWallet';
import { getEligibleWallets } from '@solana-bots/utils/getWalletsWithSOL';
import { updateMainWallet } from './updateMainWallet';
import { drainWalletsToMain } from '@solana-bots/lib/drainWallets';
import { distributeGas } from '@solana-bots/lib/split';
import { getAllWallets } from '@solana-bots/utils/getWallets';
import { getOpenPositions } from '../getPositions';
import { getPositionsView } from './getTerminalView';
import type { SerializedWallet } from '@/types/positons';
import type { Keypair } from '@solana/web3.js';
import { toKeyPair } from './toKeypaid';
import { massSell } from '@solana-bots/lib/transactions/massSell';
import { massBuy } from '@solana-bots/lib/transactions/massBuy';
import { massOutForAllWallets } from '@solana-bots/lib/transactions/massOut';



// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.parentPort.on('message', async (event) => {
      const { id, action, args, decryptedPassword } = event.data as WorkerRequest;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      
      
      try {
        let result;
        if (action === 'get:wallets:all') {
          result = await getAllWalletsView(decryptedPassword);
        } 
        else if (action === 'get:wallets:management') {
          result = await getWalletsManagementView(decryptedPassword);
        } 

        else if (action === 'get:wallets:one') {
          if (!args[0] || typeof args[0] !== 'string') {
            throw new Error('Invalid arguments: Expected a string public key');
          } else {
            result = await getByPubkey(decryptedPassword, args[0]);
          }
        }  

        else if (action === 'get:wallets:bySol') {
          if (!args[0] || typeof args[0] !== 'number') {
              throw new Error('Invalid arguments: Expected a number for SOL amount');
          } else {
             result = await getEligibleWallets(decryptedPassword, args[0]);
          }
        }


        else if (action === 'create:wallet') {
          const count = Number(args[0]);
          for (let i = 0; i < count; i++) {
            await createWallet(decryptedPassword);
          }
          result = `Successfully created ${count} wallets`;
        }
        
        else if (action === 'store:main:wallet') {
          const walletPath = args[0] as string;
          await storeMain(decryptedPassword, walletPath);
          result = `Successfully stored main wallet!`;
        }

        else if (action === 'update:new:wallet') {
           if (!args[0] || typeof args[0] !== 'string') {
               throw new Error('Invalid arguments: Expected a string for new private key');
           } 
           result = await updateMainWallet(decryptedPassword, args[0]);
        } 

        else if (action === 'drain:wallet') {
          const targetedWallets = args[0] as  { publicAddress: string; id: number }[] | undefined;
          const fee = args[1] as number | undefined;
          const drain = await drainWalletsToMain(decryptedPassword, targetedWallets, fee);

          result = drain;
          if (drain.ok) result = `Successfully drained wallets to main wallet!`;
        }



      else if (action === 'distribute:wallet') {
        const amountPerWallet = args[0] as number; 
        const targetedWallets = args[1] as { publicAddress: string | null }[];
        const fee = args[2] as number;
        
        result = await distributeGas(decryptedPassword, amountPerWallet, targetedWallets, fee);
      }

      else if (action === 'get:all:raw:wallets') {
        const data = await getAllWallets(decryptedPassword);
        const subKeys = data.subKeys.map((d) => {
          return {
            ...d,
            pubkey: d.pubkey.toBase58()
          };
        });
        result = { ...data, subKeys };
    }

    else if (action === 'get:positions') {
        result = await getOpenPositions();
    } 

    else if (action === 'get:trading:terminal:view') {
       result = await getPositionsView();
    }

    else if (action === 'trade:sell') {
      const [targetMintAddress, numberOfWallets, sellPercentage, chunksToProcess, chosenWallets, targetedPositionsToSell] = args;

      if (!targetMintAddress || !numberOfWallets || !sellPercentage) {
           throw new Error('Missing required arguments');
      }
      if (typeof targetMintAddress !== 'string') {
           throw new Error('Invalid arguments');
      }

      const target = targetMintAddress;
      const wallets = Number(numberOfWallets);
      const sellPre = Number(sellPercentage);
      const chunks = Number(chunksToProcess ?? 1);
      const chosenWall = chosenWallets as SerializedWallet[] | undefined;
      const targetedPositions = targetedPositionsToSell as number[];

      const chosen: Keypair[] = [];

      if (chosenWall && chosenWall.length > 0) {
            for (const wall of chosenWall) {
                chosen.push(toKeyPair(wall));
            }
        }
        
        result = await massSell(target, wallets, decryptedPassword, sellPre, chunks, chosen, targetedPositions);

    }

    else if (action === 'trade:buy') {
      const [targetMintAddress, solAmountsPerWallet, numberOfWallets, chunksToProcess, chosenWallets] = args;
      if (!targetMintAddress || !solAmountsPerWallet) {
           throw new Error('Missing required arguments');
      }

      if (typeof targetMintAddress !== 'string') {
           throw new Error('Invalid arguments');
      }

      const target = targetMintAddress;
      const solPerWallet = Number(solAmountsPerWallet);
      const wallets = Number(numberOfWallets);
      const chunks = Number(chunksToProcess ?? 1);
      const chosenWall = chosenWallets as SerializedWallet[] | undefined;

      const chosen: Keypair[] = [];
      if (chosenWall && chosenWall.length > 0) {
            for (const wall of chosenWall) {
                chosen.push(toKeyPair(wall));
            }
        }

       result = await massBuy(target, solPerWallet, wallets, decryptedPassword, chunks, chosen); 
    }

    else if (action === 'trade:out') {
        result = await massOutForAllWallets(decryptedPassword);
    }

    if (result !== null && typeof result === 'object' && 'ok' in result) {
      if (!result.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        throw new Error(result.reason ?? 'Underlying operation failed');
      }
      if ('data' in result) result = result.data;
      else {
        throw new Error(result.reason ?? 'Unexpected data type');
      }
    }
    
      process.parentPort.postMessage({ 
        id, 
        ok: true, 
        date: new Date().toISOString(), 
        data: result 
      });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.parentPort.postMessage({ 
            id, 
            ok: false, 
            date: new Date().toISOString(), 
            reason: message 
        });
      }
});
