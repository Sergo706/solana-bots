---
title: Introduction
description: A comprehensive overview of Solana Bots, its features, and system requirements.
icon: "lucide:info"
---

# Introduction to Solana Bots

Solana Bots is a non-custodial, locally-hosted desktop application designed for automated trading and wallet management on the Solana blockchain. It gives you the tools to manage multiple sub-wallets, automate trading strategies, and handle transactions without relying on central servers or third-party custodians.

Because the application runs entirely on your own hardware, you retain absolute control over your private keys and funds at all times.

## Core Intent

The system is built with a single goal: giving you professional-grade trading capabilities while keeping your assets secure locally. Many trading bots require you to hand over your private keys to a web server, which introduces massive security risks. Solana Bots eliminates this risk by keeping everything on your machine.

When you use this software, your computer becomes the only place where transaction signing occurs. Your raw private keys are never transmitted over the internet.

## Key Features

The application provides a complete suite of tools for managing your Solana operations. 

You can automatically generate multiple sub-wallets for parallel trading activities. The built-in gas distribution system allows you to easily fund these sub-wallets with SOL from your primary wallet, and drain the balances back when your trading session is complete.

You can perform mass buys/sells with a selected number of wallets or/and specific wallets, start a configurable volume bot to automatically simulate traffic on a token, with a real time ui.

## System Requirements

Running a local trading bot requires a stable host environment. You need a modern operating system (Windows, macOS, or Linux) with enough resources to run the application smoothly.

Because the application interacts directly with the blockchain, you must provide your own Solana RPC endpoint (default is https://api.mainnet.solana.com) and your [Jupiter](https://jup.ag/) API key. The speed and reliability of your trading directly depends on the quality of the RPC node you connect to. Using a premium RPC provider is highly recommended for optimal experience.

::note
You are entirely responsible for the security of your host machine. If your computer is compromised by malware or a keylogger, your funds are at risk.
::

## Security and Storage

Your data is stored locally in an encrypted SQLite database. When you first launch the app, you set a master password. The system uses Scrypt for key derivation and AES-256-GCM to encrypt your wallets, private keys, and API credentials.

::warning
There is no password recovery mechanism. If you lose your master password, you permanently lose access to your local database and the funds in your sub-wallets.
::

## Before you start

Make sure you read the [disclaimer, limitations and terms of solana bots](/legal/disclaimer), before you use this software.