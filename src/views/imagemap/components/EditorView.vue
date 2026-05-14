<script setup lang="ts">
import { useRectManager } from '@/composables/useRectManager'

import EditorForm from '@/views/imagemap/components/editor/EditorForm.vue'
import EditorCanvas from '@/views/imagemap/components/editor/EditorCanvas.vue'

const rectStore = useRectManager()
</script>

<template>
  <div class="flex justify-between">
    <div class="w-1/3 rounded-md border p-2">
      <EditorForm :store="rectStore" />
    </div>
    <div class="w-2/3 p-2">
      <EditorCanvas :store="rectStore" />
    </div>
  </div>
</template>
