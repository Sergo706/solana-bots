import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import * as fs from "fs";

async function checkAccount() {
 // 1. Read the file
const secretKeyString = fs.readFileSync("/home/sergio/Desktop/solana-bots/wallet-keypair.json", "utf8");

// 2. Parse the JSON array
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const mainWallet = Keypair.fromSecretKey(secretKey);
console.log("Wallet Loaded!");
console.log("Public Key (Address):", mainWallet.publicKey.toBase58());


  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accountInfo = await connection.getAccountInfo(mainWallet.publicKey);
  
  if (accountInfo === null) {
    console.log("Account not found on-chain. Did the airdrop fail?");
  } else {
    console.log("Account Found!");
    console.log(JSON.stringify(accountInfo, null, 2));
  }
}


checkAccount();
