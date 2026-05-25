---
title: Security Best Practices for Self-Custody
description: Essential tips to keep your wallets and assets secure when trading on Solana.
tags: ["security", "solana", "wallets"]
image: "/images/blog/security_vault.png"
author: "Sergio"
authorImg: "https://avatars.githubusercontent.com/u/187537278?v=4"
authorGithub: "https://github.com/Sergo706"
authorGithubUserName: "Sergo706"
featured: false
date: 2026-05-27T00:00:00.000Z
readingTime: "10 min"
---

# Security Best Practices for Self-Custody

Welcome to the definitive guide on keeping your digital assets safe while using 
Solana Bots. When you step into the world of decentralized finance and begin 
deploying automated trading strategies, you are taking absolute control of your 
financial destiny. There are no banks, no customer support lines, and no corporate 
vaults holding your money. You are your own bank. 

This level of self-custody provides incredible freedom and eliminates third-party 
risk, but it also means that the responsibility for security falls entirely on 
your shoulders. If you make a mistake, there is no centralized entity that can 
intervene to recover your assets. 

In this comprehensive guide, we will walk you through the precise security 
architecture of Solana Bots. We will explain exactly how the tool protects your 
private information, why certain files on your computer are critical, and how 
you can perform routine maintenance—such as clearing your state or changing 
your main wallet—without ever putting your funds at risk.

## 1. The Core Security Philosophy of Solana Bots

The most important thing to understand about Solana Bots is that it operates 
entirely on your local machine. It is not a cloud-based web service. It does 
not upload your private keys to a remote server, nor does it send your passwords 
over the internet to be stored in a corporate database. 

When you install and run the application, everything happens right there on 
your desktop. The interface you interact with, the background worker processes 
that execute your trades, and the database that records your portfolio all live 
exclusively on your personal hard drive. 

This architectural decision completely insulates you from massive honeypot hacks. 
If a centralized trading platform gets breached by malicious actors, thousands 
of users lose their funds simultaneously. Because Solana Bots is entirely 
decentralized and local, an attacker would need to gain physical or direct 
remote access to your specific personal computer to even attempt to compromise 
your trading operation.

## 2. Understanding the Master Password

When you first launch the application, you are prompted to create a master 
password. This is not a traditional account password. There is no "Forgot Password" 
button, and no email recovery process. 

Your master password is the cryptographic key that locks and unlocks the vault 
containing your private trading credentials. When you input your main wallet's 
private key, the application uses your master password to run a highly secure, 
industry-standard encryption algorithm (specifically AES-256). The resulting 
encrypted data looks like random gibberish and is completely useless to anyone 
who does not possess your exact master password.

Because the software never transmits this password to any external servers, we 
have absolutely no way to recover it for you if it is lost. If you forget your 
master password, the application will permanently lose its ability to decrypt 
your sub-wallets, and any funds left inside those specific wallets will be 
irretrievable. Therefore, it is absolutely critical that you memorize your 
password or store it in a highly secure, offline physical location, such as a 
fireproof safe or a dedicated hardware password manager.

## 3. The Critical Importance of the wallets.db File

As you use the application to generate sub-wallets and execute distributed 
trading strategies, the software needs a place to remember all these new 
addresses and encrypted keys. It stores all this vital information in a single, 
local database file named `wallets.db`.

This file is the absolute lifeblood of your automated trading operation. It is 
located within your system's hidden application data directory. Inside this 
file, the software safely records the encrypted private keys for every single 
sub-wallet you have generated. 

You must treat the `wallets.db` file with the same extreme caution you would 
give to a physical wallet full of cash. 

**Never Delete This File While Trading.** If you manually delete the `wallets.db` 
file from your hard drive, the application will instantly forget that your 
sub-wallets exist. If those sub-wallets were holding SOL or other digital 
tokens at the time of deletion, you will lose access to those funds forever, 
as the encrypted keys required to move them will have been destroyed. 

If you ever need to uninstall the application, migrate to a new computer, or 
perform a hard reset of your trading environment, you must always ensure that 
all your funds have been safely extracted from the system first.

## 4. How to Safely Start a Clear State

There may come a time when you want to start fresh. Perhaps you want to clear 
out old sub-wallets, reset your trading metrics, or wipe the local database to 
begin a brand new campaign. 

Doing this securely requires a very specific sequence of events to ensure no 
funds are accidentally orphaned. You cannot simply delete the `wallets.db` file 
and hope for the best. Instead, you must use the application's built-in 
draining mechanisms.

**Step 1: Halt All Automation**
Before attempting any cleanup, ensure that the Volume Bot and any other automated 
background tasks are completely stopped. You do not want the engine attempting 
to buy new tokens while you are trying to consolidate your funds.

**Step 2: Execute the Drain Command**
Navigate to the wallet management section of the dashboard and locate the Drain 
feature. This powerful command instructs the software to systematically scan 
every single sub-wallet recorded in your `wallets.db` ledger. It checks the 
balance of each wallet, calculates the necessary network transaction fees, and 
sends every remaining drop of SOL back to your designated Main Wallet.

**Step 3: Verify the Consolidation**
Wait for the drain process to finish. The application will log the success of 
each transfer. Once it completes, check your Main Wallet's balance using an 
external block explorer like Solscan to verify that all your capital has been 
safely returned.

**Step 4: Wipe the State**
Only after you have absolute confirmation that your sub-wallets are completely 
empty (holding exactly 0.00 SOL) is it safe to proceed. At this point, the 
encrypted keys stored in `wallets.db` are essentially worthless because the 
wallets they unlock contain no assets. You may now safely delete the database 
file.

## 5. How to Securely Change Your Main Wallet

Your Main Wallet acts as the central funding hub for your entire automation 
network. It provides the initial capital that gets distributed to the sub-wallets, 
and it serves as the final destination when you drain your profits. 

If you ever feel that your Main Wallet has been exposed, or if you simply want 
to migrate your operations to a new, fresh address for accounting purposes, you 
must execute the transition carefully. 

**Step 1: Drain the Network to the Old Main Wallet**
Just like starting a clear state, you must first stop all active trading loops. 
Use the Drain command to pull all funds from your active sub-wallets back into 
your current (old) Main Wallet. Ensure the sub-wallets are completely empty.

**Step 2: Transfer Funds Externally**
Now that all your capital is consolidated in your old Main Wallet, use a standard 
Solana interface (such as Phantom or Solflare) to manually send your entire 
balance from the old Main Wallet to your newly generated Main Wallet address. 

**Step 3: Reset the Application State**
Because your old sub-wallets are inextricably tied to the old configuration, it 
is best practice to completely reset your environment. Follow the steps outlined 
above to delete the `wallets.db` file now that you know it only contains keys 
for empty wallets. 

**Step 4: Initialize the New Main Wallet**
Relaunch Solana Bots. Because the old database is gone, the application will 
prompt you for initial setup. Provide your new master password and input the 
private key for your completely fresh, fully funded new Main Wallet. You can 
now safely generate a new batch of sub-wallets, distribute your funds, and 
resume trading with a pristine security posture.

## 6. API Key Security and Network Resilience

In addition to your wallet private keys, Solana Bots also requires access to 
various third-party services to function optimally. This includes Jupiter API 
keys for highly advanced swap routing and custom RPC (Remote Procedure Call) 
node endpoints to ensure your transactions reach the blockchain quickly.

**Encrypted API Storage:**
Just like your private wallet keys, the application treats your Jupiter API credential 
with the utmost respect. This api key is also immediately encrypted using the exact same AES-256 algorithm and 
master password combination. They are securely stored alongside your wallets 
in the local database. If someone gains unauthorized access to your computer 
but does not have your master password, they will be completely unable to read 
or steal your expensive API credentials.

**The Security of Private RPCs:**
While it is technically possible to use public Solana endpoints, doing so exposes 
your trading operation to significant risks. Public nodes are frequently congested, 
meaning your critical buy and sell orders might time out during periods of 
extreme market volatility. More importantly, heavily monitored public endpoints 
can sometimes leak metadata about your trading strategies. 

By investing in a private, dedicated RPC node, you establish a direct, secure 
pipeline between your desktop application and the Solana blockchain. This private 
connection not only guarantees faster execution speeds, which is paramount for 
volume trading, but it also shields your transaction broadcasts from the prying 
eyes of public network sniffers. 

## 7. General Security Hygiene

Beyond the specific mechanics of the application, maintaining a secure trading 
environment requires strict personal hygiene regarding your digital presence.

**Use Dedicated Hardware:** If you are running high-volume trading bots with 
significant capital, consider using a dedicated, clean computer. Do not use 
the same machine to browse sketchy websites, download unverified software, or 
open personal email attachments. Isolating your trading environment minimizes 
the risk of background malware capturing your keystrokes when you enter your 
master password.

**Beware of Phishing:** The decentralized finance space is heavily targeted by 
scammers. Always ensure you are downloading updates to Solana Bots directly 
from the official GitHub repository or from this site, specifically https://solana.riavzon.com/download. Never trust direct 
messages on Discord or Telegram offering "upgraded" versions of the software. 

**Understand the Limits of Hot Wallets:** The sub-wallets generated by Solana 
Bots are by definition "hot wallets." They are actively connected to the network 
and their keys are stored locally to facilitate rapid, automated trading. You 
should only ever keep capital inside the application that you actively intend 
to trade with. For long-term holding and deep savings, always use a cold storage 
hardware wallet (like a Ledger or Trezor) that remains completely disconnected 
from any automated trading scripts.

By understanding how the application handles your encryption, respecting the 
critical nature of the local database, and following disciplined procedures for 
managing your assets, you can enjoy the immense power of automated trading 
without compromising your security.