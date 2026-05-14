<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  btnWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  btnWidth: 'w-80'
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    :type="props.type"
    class="btn-base bg-purple4 hover:bg-purple2 flex items-center justify-center p-3 text-white"
    :class="props.btnWidth"
    @click="emit('click', $event)"
  >
    <!-- 帶 icon 的左側樣式 -->
    <span v-if="$slots.prepend" class="mr-2">
      <slot name="prepend" />
    </span>
    <!-- 純文字樣式 -->
    <span v-if="$slots.default">
      <slot />
    </span>
    <!-- 帶 icon 的右側樣式 -->
    <span v-if="$slots.append" class="ml-2">
      <slot name="append" />
    </span>
  </button>
</template>
