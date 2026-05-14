<script setup lang="ts">
import { Field, ErrorMessage, useField } from 'vee-validate'
import { watch } from 'vue'

type SelectOption = {
  label: string
  value: string
}

interface Props {
  label?: string
  options: SelectOption[]
  name: string
  placeholder: string
  type?: string
  rules?: string
  inline?: boolean
  fullWidth?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  options: () => [],
  name: '',
  placeholder: '請選擇',
  type: 'text',
  rules: '',
  inline: true,
  fullWidth: false,
  isDisabled: false
})

const emit = defineEmits(['change'])

const { value } = useField(() => props.name)

watch(value, (newVal) => {
  emit('change', newVal)
})
</script>

<template>
  <div :class="{ flex: props.inline, 'gap-2': props.label, 'w-full': props.fullWidth }">
    <Field
      :name="props.name"
      :type="props.type"
      :rules="props.rules"
      v-slot="{ field, errorMessage }"
    >
      <div v-if="props.label" class="flex h-[42px] items-center">
        <!-- 標籤名稱 -->
        <label class="whitespace-nowrap" :class="{ 'text-red-500': errorMessage }">{{
          props.label
        }}</label>
        <!-- 標籤右側 -->
        <slot v-if="$slots['label-extra']" name="label-extra" />
      </div>
      <div class="card flex flex-col text-left" :class="{ 'w-full': props.fullWidth }">
        <Select
          v-bind="field"
          @change="field.onChange($event.value)"
          :options="props.options"
          option-label="label"
          option-value="value"
          :placeholder="props.placeholder"
          :class="[
            {
              'p-invalid': errorMessage
            },
            props.fullWidth ? 'w-full' : 'md:w-56'
          ]"
          :disabled="props.isDisabled"
          :model-value="field.value"
          @update:model-value="field['onUpdate:modelValue']"
        />
        <ErrorMessage :name="props.name" class="block text-left whitespace-nowrap text-red-500" />
      </div>
    </Field>
  </div>
</template>
