<script setup lang="ts">
type StepItem = {
  title: string
  value: string
}

interface Props {
  steps: StepItem[]
  modelValue: string
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  modelValue: '1'
})

// 「聲明」該元件會發出這個事件，但在 Script 裡不會用到它
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="card flex justify-center">
    <Stepper class="w-full" :value="modelValue">
      <StepList>
        <Step v-for="step in props.steps" :key="step.value" :value="step.value">
          {{ step.title }}
        </Step>
      </StepList>
      <StepPanels>
        <StepPanel
          v-for="step in props.steps"
          :key="step.value"
          v-slot="{ activateCallback }"
          :value="step.value"
        >
          <slot :name="`content-${step.value}`" :activate-callback="activateCallback" />
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
