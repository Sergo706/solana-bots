---
title: Security
description: Learn about how the system secures your data.
type: security
date: 2026-05-25T00:00:00.000Z
---

This document details the local process isolation, storage, and cryptographic configurations used to secure wallets, private keys, and transactions.

::note
If you discover a security vulnerability within Solana Bots, please contact me directly at this [link](https://riavzon.com/contact).
::

## Process Isolation

The app runs on Electron, and the user interface is completely isolated from the main system operations.

When you use the app, the UI runs in a sandbox (`nodeIntegration: false` and `contextIsolation: true`). This means it can't directly access native system APIs. There is also a strict Content Security Policy (CSP) that blocks unauthorized scripts or connections:
```js
default-src 'self' 'unsafe-inline' data:;
script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:5173;
connect-src 'self' https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com ws://localhost:5173 http://localhost:5173;
```

To talk to the backend, the UI uses specific, safe functions exposed in `preload.ts`. It doesn't have raw access to the underlying IPC tools.

When the app does heavy lifting like generating wallets, encrypting data, or running database queries, it uses a separate background process. The main app talks to this background worker using random IDs to ensure every request is matched securely. This keeps all the sensitive work completely separate from the UI you interact with.

---

## Password & Cryptography

The application secures credentials using OS-level storage and symmetric encryption, the master password you enter when first opening the app, used to encrypt and decrypt your wallets and api keys.
When running the ui, you prompted to enter your password. In the time the app runs your password is stored encrypted via Electron's native `safeStorage` API using native credential managers of your os in a local variable as a base64 string, which is cleaned when the app/window is closed.


### Key Derivation

This password is used with **Scrypt** with the following parameters: `N = 16384`, `r = 8`, `p = 1`, to get a 32-byte key, with a random salt of
32-byte. 

All wallets, private keys, and API keys, are encrypted using **AES-256-GCM** with the key generated with the mechanism described above.

When you make or request a sensitive data, your password (if using the ui) gets decrypted on demand, and sended upstream to get wallets or to perform a sensitive action buy/sell etc.

---

## Database Storage

All your data is stored locally on your computer in a SQLite database (`wallets.db`), keeping it completely offline and out of the cloud.

If you are on Windows, you can find the file in `%APPDATA%/SolanaBot`. On macOS or Linux, it's located in `~/.solana-bot`.

The app uses standard configurations (`WAL` journal mode) to make sure your data is saved quickly and doesn't get corrupted if your computer loses power. When you start the app, any necessary database updates run automatically in the isolated background process.

::warning
Deleting or losing this file while you still have funds in your sub-wallets will result in losing them permanently.
::

---

## Blockchain Operations

When you make a trade, everything is built and signed locally on your machine.

Your private keys are only decrypted in memory at the exact second they are needed to sign a transaction. They are never written to any temporary files or logs. The app converts them into Solana keypairs in the background, signs the transaction, and only sends the signed result over the network.

The app uses a primary wallet to fund your trading activities, separating it from the sub-wallets used by the bot. You can use built-in tools to easily distribute SOL to your sub-wallets or drain funds back to your main wallet when you are done.

---

## Limitations

Since the app runs entirely on your own machine and there are no central servers, keeping your computer secure is up to you.

There is no "forgot password" button. If you lose your master password, you lose access to your local database and the funds in your sub-wallets permanently.

The app uses the RPC endpoints and API keys you provide. Make sure you use a trusted RPC provider, since a compromised node could log your transaction requests or return fake data.

Local encryption protects your files, but it can't stop malware or keyloggers on your computer from stealing your password while you type it. Keep your machine free of viruses, and don't share your database file or password with anyone.
