<script setup lang="ts">
import { Form } from 'vee-validate'
import type { SubmissionHandler } from 'vee-validate'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  schema?: object
  btnWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  schema: undefined,
  btnWidth: 'w-80'
})

const emit = defineEmits(['submit'])

const onHandleSubmit: SubmissionHandler = (values, actions) => {
  emit('submit', values, actions)
}
</script>

<template>
  <Form
    :validation-schema="props.schema"
    @submit="onHandleSubmit"
    v-slot="{ errors, values, setFieldValue }"
  >
    <div class="flex flex-col gap-4">
      <slot :errors="errors" :values="values" :set-field-value="setFieldValue" />

      <slot name="footer">
        <!-- 套用通用按鈕 -->
        <BaseButton type="submit" :btn-width="props.btnWidth">
          <template v-if="$slots['btn-prepend']" #prepend>
            <slot name="btn-prepend" />
          </template>

          <!-- 按鈕文字 -->
          <slot name="btn-text" />

          <template v-if="$slots['btn-append']" #append>
            <slot name="btn-append" />
          </template>
        </BaseButton>
      </slot>
    </div>
  </Form>
</template>
