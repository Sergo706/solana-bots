<script setup lang="ts">


defineProps<{
    openBuy: boolean,
    openSell: boolean
    openOut: boolean
    openVol: boolean
    openCreateWallets: boolean
    openAddFunds: boolean
    openDrain: boolean
}>();

const emit = defineEmits<(e: 'close', value: boolean) => void>();

</script>

<template>
  <TradeModal
    :show-btn="false"
    :open="openBuy"
    title="Buy"
    :msg="'Start new positions'"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <BuyForm />
    </template>
  </TradeModal>



  <TradeModal
    :show-btn="false"
    title="Sell" 
    :open="openSell"
    :msg="'Start mass sell'"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <SellForm />
    </template>
  </TradeModal>

  <TradeModal
    :show-btn="false"
    :open="openOut"
    title="Close all positions"
    :msg="'Close all open positions your sub wallets haves'"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <MassOutButton />
    </template>
  </TradeModal>

  <TradeModal
    :show-btn="false"
    title="Start Bot"
    :open="openVol"
    :msg="'Start & Configure the volume bot'"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <VolumeBotsForm />
    </template>
  </TradeModal>

  <TradeModal
    :show-btn="false"
    :open="openCreateWallets"
    title="Create Wallets"
    :msg="'Create newly fresh wallets'"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <CreateWalletsForm />
    </template>
  </TradeModal>

  <TradeModal
    :show-btn="false"
    title="Add Funds"
    :msg="'Distribute Funds for your wallets'"
    :open="openAddFunds"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <DistributeFundsForm />
    </template>
  </TradeModal>

  <TradeModal
    :show-btn="false"
    title="Withdrawn Funds"
    :msg="'Withdrawn Funds from your wallet(s)'"
    :open="openDrain"
    @close="(e) => emit('close', e)"
  > 
    <template #contentModal>
      <DrainFundsForm />
    </template>
  </TradeModal>
</template>