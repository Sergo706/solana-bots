# solana-bots

solana-bots is a cli tool to create/manage Solana wallets, and perform mass trades operations on the solana network. Powered by the Jupiter api.


# Features

- Create and manage an unlimited number of sub-wallets from a single master wallet.

- All private keys are stored in a local SQLite database, encrypted using `AES-256` with a your defined password.

- Single-command execution for distributing SOL (split), gathering SOL (drain), and bulk token swaps (mass buy/sell/out).

- A background worker that rotates through wallets, checking balances on-chain before executing trades to ensure zero failed transactions.

- Every trade is recorded as a "Position" in the database, allowing for sell-offs and "Out" operations without querying the blockchain for account data.

- Integrated with Jupiter’s Order/Execute API to handle versioned transactions and priority fees automatically.

Every important moment should emit an event:

bot started
wallet selected
buy succeeded
sell succeeded
error happened
cycle completed
bot stopped


The clean architecture
Start

Renderer clicks Start.

Vue calls ipcRenderer.invoke('trade:volume-bot', ...)
Main decrypts vault password
Main starts the bot worker
Main immediately returns { ok: true }
Worker keeps running in background
Live updates

While worker runs:

Worker emits logs / state changes
Main receives them
Main forwards them with webContents.send(...)
Vue updates cards, feed, and terminal instantly
Stop

Renderer clicks Stop.

Vue calls ipcRenderer.invoke('trade:volume-bot:stop')
Main signals the worker
Worker cleans up
Worker emits final stopped event
UI flips to stopped



How your current UI maps to the stream
Stats cards

Update from stats events.

Examples:

cycleRuns
totalBuys
totalSells
errors
status
target
currentAction
pl
Activity feed

Update from activity events.

Examples:

Wallet 5 → Buy 0.1 SOL
Wallet 12 → Sell 0.08 SOL

This is your “what just happened” strip.

Terminal log

Update from log events.

Examples:

[INFO] Connecting to Jupiter
[BUY] Wallet #5 bought ...
[ERROR] RPC rate limit hit

This is your verbose history.


Where each file should belong
volumeStart

This should only start the worker and return the pid / runId.

Right now it uses detached: true and stdio: "ignore", which is fine for a silent background job, but not for real-time UI.

volumeBot()

This should become event-aware.

Inside the loop, after each meaningful step, emit a structured event.

main ipc

This is where you connect live events to the window.

This file should:

store active process handles
listen for output/events
forward them to renderer
expose start/stop/status
preload

This is your API surface for the UI.

Add a listener method, not just invoke() methods.

You need something like:

onVolumeBotUpdate(callback)
onVolumeBotLog(callback)
onVolumeBotStats(callback)

So the renderer can subscribe.

Vue view

This just subscribes once on mount and mutates reactive state.


Practical version of the data flow
massBuy / massSell
   ↓
volumeBot loop
   ↓
emit log/activity/stats event
   ↓
Electron main receives
   ↓
webContents.send('trade:volume-bot:event', payload)
   ↓
preload exposes listener
   ↓
Vue updates refs/reactive state
The most important design choice

You should treat the file:

volumeBot.stats.json

as backup state, not live state.

Use it for:

restoring the UI after reload
showing status when the app opens
debugging
confirming the worker is alive

Do not rely on it for smooth real-time UI.

One sentence summary

Worker produces events, main relays them, preload exposes them, Vue renders them.

That is the mental map.