# solana-bots

solana-bots is a cli tool to create/manage Solana wallets, and perform mass trades operations on the solana network. Powered by the Jupiter api.


# Features

- Create and manage an unlimited number of sub-wallets from a single master wallet.

- All private keys are stored in a local SQLite database, encrypted using `AES-256` with a your defined password.

- Single-command execution for distributing SOL (split), gathering SOL (drain), and bulk token swaps (mass buy/sell/out).

- A background worker that rotates through wallets, checking balances on-chain before executing trades to ensure zero failed transactions.

- Every trade is recorded as a "Position" in the database, allowing for sell-offs and "Out" operations without querying the blockchain for account data.

- Integrated with Jupiter’s Order/Execute API to handle versioned transactions and priority fees automatically.