<script setup lang="ts">
import { Field, ErrorMessage, useField } from 'vee-validate'
import { watch } from 'vue'

interface Props {
  name: string
  type?: string
  rules?: string
  label?: string
  placeholder?: string
  inline?: boolean
  isDisabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  type: 'text',
  rules: '',
  label: '',
  placeholder: '請輸入',
  inline: true,
  isDisabled: false,
  fullWidth: false
})

const emit = defineEmits(['change'])

const { value } = useField(() => props.name)

watch(value, (newVal) => {
  emit('change', newVal)
})
</script>

<template>
  <Field
    :name="props.name"
    :type="props.type"
    :rules="props.rules"
    v-slot="{ field, errorMessage }"
  >
    <div :class="{ flex: props.inline, 'gap-2': props.label, 'w-full': props.fullWidth }">
      <div v-if="props.label" class="flex h-[42px] items-center">
        <!-- 標籤名稱 -->
        <label
          :for="props.name"
          class="whitespace-nowrap"
          :class="{ 'text-red-500': errorMessage }"
          >{{ props.label }}</label
        >
        <!-- 標籤右側 -->
        <slot v-if="$slots['label-extra']" name="label-extra" />
      </div>
      <div :class="{ 'w-full': props.fullWidth }">
        <div class="relative">
          <!-- 輸入框裡左側 -->
          <div v-if="$slots.prepend" class="absolute top-1/2 left-3 -translate-y-1/2">
            <slot name="prepend" />
          </div>

          <InputText
            v-bind="field"
            :id="props.name"
            :type="props.type"
            :placeholder="placeholder"
            :class="{
              'p-invalid': errorMessage,
              '!pl-10': $slots.prepend,
              '!pr-10': $slots.append,
              'w-full': props.fullWidth
            }"
            :disabled="props.isDisabled"
            :model-value="field.value"
            @update:model-value="field['onUpdate:modelValue']"
            @keydown.delete.stop
          />

          <!-- 輸入框裡右側 -->
          <div v-if="$slots.append" class="absolute top-1/2 right-3 -translate-y-1/2">
            <slot name="append" />
          </div>
        </div>
        <ErrorMessage :name="props.name" class="block text-left text-red-500" />
      </div>
    </div>
  </Field>
</template>
