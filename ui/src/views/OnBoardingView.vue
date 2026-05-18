<script setup lang="ts">
import { useTemplateRef, ref } from 'vue';
import type { StepperItem } from '@nuxt/ui';
import StepOne from '@/components/OnboardingForms/StepOne.vue';
import StepTwo from '@/components/OnboardingForms/StepTwo.vue';
import SetPassword from '@/components/OnboardingForms/SetPassword.vue';
import StepThree from '@/components/OnboardingForms/StepThree.vue';
import { useRoute } from 'vue-router';

const startOn = ref(false);
const active = ref(0);
const passwordUpdate = ref(useRoute().path === '/password');
const stepper = useTemplateRef('stepper');
const items: StepperItem[] = [
  {
    title: 'Main Wallet & Setup',
    description: 'First lets add your main wallet and passwords.',
    icon: 'i-lucide-wallet'
  },
  {
    title: 'RPC & Jupiter API key',
    description: 'Set up an RPC and the Jupiter API key',
    icon: 'i-lucide-cloud'
  },
  {
    title: 'Sub Wallets (Optional)',
    description: 'Create some sub wallets and distribute funds across them',
    icon: 'i-lucide-users'
  },
];



</script>

<template>
  <UContainer class="w-full m-auto p-8">
    <div class="w-full m-auto p-6">
      <div class="flex flex-col gap-10 pb-4">
        <UEmpty 
          v-if="!startOn && !passwordUpdate"
          size="xl"
          class="flex-1 min-h-[550px] grid place-content-center text-center"
          icon="i-lucide-rocket"
          title="Get started" 
          description="Create your main wallet, configure an RPC and Jupiter API key, then optionally generate sub-wallets and distribute SOL to start mass gambling on Solana."
          :ui="{ root: 'ring-0' }"
          :actions="[
            {
              icon: 'i-lucide-rocket',
              label: 'Get started',
              size: 'md',
              class: 'cursor-pointer',
              variant: 'subtle',
              color: 'primary',
              onClick: () => { startOn = true }
            }
          ]"
        />

        <SetPassword v-if="passwordUpdate" /> 
      </div>
      <UStepper
        v-if="startOn && !passwordUpdate"
        ref="stepper"
        v-model="active"
        :items="items"
      >
        <template #content="{ item }">
          <div class="flex flex-col items-center justify-center gap-4 m-auto mt-5">
            <UPageCard 
              class="w-full max-w-3xl"
              variant="outline"
              :ui="{
                wrapper: 'flex flex-col flex-1 items-center justify-center',
              }"
            >
              <template
                #header
              >
                <div class="mx-auto flex w-fit flex-col items-center justify-center gap-4 text-center">
                  <UIcon
                    :name="item.icon"
                    class="size-10"
                  />

                  <h2>
                    {{ item.title }}
                  </h2>

                  {{ item.description }}
                </div>
              </template>

              <StepOne
                v-if="active === 0"
                @submitted="stepper?.next()"
              />

              <StepTwo
                v-if="active === 1"
                @submitted="stepper?.next()"
              />
              <StepThree
                v-if="active === 2"
              />
            </UPageCard>
          </div>
        </template>
      </UStepper>
    </div>
  </UContainer>
</template>

