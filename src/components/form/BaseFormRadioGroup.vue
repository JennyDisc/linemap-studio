<script setup lang="ts">
import { Field, ErrorMessage, useField } from 'vee-validate'
import { watch } from 'vue'

type RadioOption = {
  label: string
  value: string
}

interface Props {
  inline?: boolean
  label?: string
  options: RadioOption[]
  name: string
  type?: string
  rules?: string
}

const props = withDefaults(defineProps<Props>(), {
  inline: true,
  label: '',
  options: () => [],
  name: '',
  type: 'text',
  rules: ''
})

const emit = defineEmits(['change'])

const { value } = useField(() => props.name)

watch(value, (newVal) => {
  emit('change', newVal)
})
</script>

<template>
  <div :class="{ 'flex gap-2': props.inline }">
    <div v-if="props.label" class="flex h-[42px] items-center">
      <!-- 標籤名稱 -->
      <label class="whitespace-nowrap" :class="{ 'text-red-500': errorMessage }">{{
        props.label
      }}</label>
      <!-- 標籤右側 -->
      <slot v-if="$slots['label-extra']" name="label-extra" />
    </div>
    <Field
      :name="props.name"
      :type="props.type"
      :rules="props.rules"
      v-slot="{ field, errorMessage }"
    >
      <div class="card flex flex-col justify-center">
        <div class="flex h-[42px] flex-wrap items-center gap-4">
          <div
            class="flex items-center gap-2"
            v-for="(option, index) in props.options"
            :key="option.value"
          >
            <RadioButton
              v-bind="field"
              :input-id="`${props.name}-${index}`"
              :name="props.name"
              :value="option.value"
              :class="{
                'p-invalid': errorMessage
              }"
              :model-value="field.value"
              @update:model-value="field['onUpdate:modelValue']"
            />
            <label :for="`${props.name}-${index}`">{{ option.label }}</label>
          </div>
        </div>
        <ErrorMessage :name="props.name" class="block text-left whitespace-nowrap text-red-500" />
      </div>
    </Field>
  </div>
</template>
