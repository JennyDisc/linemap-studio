<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRectManager, rectState } from '@/composables/useRectManager'
import type { AreaItem } from '@/composables/useRectManager'

import BaseForm from '@/components/form/BaseForm.vue'
import BaseFormRadioGroup from '@/components/form/BaseFormRadioGroup.vue'

const props = defineProps<{
  store: ReturnType<typeof useRectManager>
}>()

const { setImageType, selectArea, triggerDelete } = props.store
const selectedRectId = ref()
const getRectanglesInfo = ref<GetRectanglesInfo>({
  nativeSize: { width: 0, height: 0 },
  baseSize: { width: 0, height: 0 },
  areas: []
})

type GetRectanglesInfo = {
  nativeSize: {
    width: number
    height: number
  }
  baseSize: {
    width: number
    height: number
  }
  areas: AreaItem[]
}

type OptionItem = {
  value: string
  label: string
  actionValueLabelName: string | null
  placeholder: string | null
  apiKey: string | null
}

const options: OptionItem[] = [
  {
    value: 'message',
    label: '訊息動作',
    actionValueLabelName: '文字',
    placeholder: '請輸入文字',
    apiKey: 'text'
  },
  {
    value: 'uri',
    label: 'URL動作',
    actionValueLabelName: 'URL',
    placeholder: '請輸入 URL',
    apiKey: 'linkUri'
  }
]

const currentActionTypeOption = (type: string) => {
  const safeType = type ?? ''
  const result = options.find((item) => item.value === safeType)

  if (!result)
    return {
      value: '',
      label: '',
      actionValueLabelName: '',
      placeholder: '',
      apiKey: ''
    }

  return result
}

const handleActionTypeChange = (data: AreaItem, setFieldValue: any) => {
  setFieldValue(`actionValue_${data.rectId}`, '')
}

watch(
  () => rectState.rectanglesInfo,
  (newVal) => {
    if (!newVal?.areas) return

    // 建立新矩形的 rectId 清單
    const newRectIds = newVal.areas.map((r) => r.rectId)

    // 刪除已不存在的矩形
    getRectanglesInfo.value.areas = getRectanglesInfo.value.areas.filter((r) =>
      newRectIds.includes(r.rectId)
    )

    // 更新或新增矩形
    newVal.areas.forEach((newArea) => {
      const existing = getRectanglesInfo.value.areas.find((r) => r.rectId === newArea.rectId)

      if (existing) {
        // 更新座標、大小等基礎資訊，不覆蓋 actionType/actionValue
        existing.x = newArea.x
        existing.y = newArea.y
        existing.width = newArea.width
        existing.height = newArea.height
      } else {
        // 新增矩形，保留原始結構
        getRectanglesInfo.value.areas.push({ ...newArea })
      }
    })

    // 重新編號 no（連號），讓 vue 重新渲染資料集
    getRectanglesInfo.value.areas.forEach((r, index) => {
      r.no = index + 1
    })

    // 更新 nativeSize
    getRectanglesInfo.value.nativeSize = { ...newVal.nativeSize }
  },
  { deep: true }
)

watch(
  () => rectState.selectedRectIndex,
  (newVal) => {
    selectedRectId.value = newVal
  }
)

// 整理成提交 API 格式
const formatRectanglesForApi = (values: any) => {
  const actions = getRectanglesInfo.value.areas.map((r) => {
    const currentType = values[`actionType_${r.rectId}`]
    const currentValue = values[`actionValue_${r.rectId}`]
    const option = options.find((item) => item.value === currentType)

    const result: Record<string, any> = {
      type: currentType || '',
      area: {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height
      }
    }

    if (option?.apiKey) {
      result[option.apiKey] = currentValue || ''
    }

    return result
  })

  const messages = [
    {
      type: 'imagemap',
      baseUrl: '',
      altText: 'This is an imagemap',
      baseSize: rectState.rectanglesInfo.baseSize,
      actions: actions
    }
  ]
  console.log('整理好給api的資料', messages)
  return {
    to: '',
    ...messages
  }
}
</script>

<template>
  <BaseForm btn-width="w-48" @submit="formatRectanglesForApi">
    <template #default="{ values, setFieldValue }">
      <!-- 圖片 -->
      <div class="mb-4">
        <div class="flex items-center gap-2">
          <img src="/img/img-icon.svg" alt="圖片icon" class="h-4 w-4" />
          <p class="text-lg font-bold">圖片</p>
        </div>
        <BaseFormRadioGroup
          name="imageType"
          :options="[
            { label: '樣式1', value: '20260421_latest_offer_v1' },
            { label: '樣式2', value: '20260421_latest_offer_v2' }
          ]"
          rules="required"
          @change="(val) => setImageType(val)"
        >
        </BaseFormRadioGroup>
      </div>
      <!-- 動作 -->
      <div>
        <div class="mb-2 flex items-center gap-2">
          <img src="/img/hotspot-icon.svg" alt="熱點icon" class="h-4 w-4" />
          <p class="text-lg font-bold">動作</p>
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-for="(data, index) in rectState.rectanglesInfo.areas"
            :key="data.rectId"
            class="rounded-lg border p-2"
            :class="[
              selectedRectId === data.rectId ? 'border-[#4F46E5] bg-[#4F46E5]/30' : 'border-gray2'
            ]"
            @click="selectArea(data.rectId)"
          >
            <!-- 標題 -->
            <div class="mb-4 flex items-center justify-between">
              <p class="bg-purple4 rounded-lg px-2 py-1 text-white">動作{{ index + 1 }}</p>
              <button type="button" class="cursor-pointer" @click="triggerDelete(data.rectId)">
                <img src="/img/trash-icon.svg" alt="垃圾桶icon" class="h-[40px] w-[40px]" />
              </button>
            </div>
            <!-- 項目 -->
            <div class="mb-4">
              <BaseFormInput
                label="範圍"
                :name="`scope_${data.rectId}`"
                :model-value="`x=${data.x}, y=${data.y}, 寬=${data.width}, 高=${data.height}`"
                rules="required"
                :inline="false"
                :is-disabled="true"
                :full-width="true"
              />
            </div>
            <div class="mb-4">
              <BaseFormSelect
                :name="`actionType_${data.rectId}`"
                label="類型"
                placeholder="請選擇類型"
                rules="required"
                :inline="false"
                :full-width="true"
                :options="[
                  { label: '訊息動作', value: 'message' },
                  { label: 'URL 動作', value: 'uri' }
                ]"
                :is-disabled="selectedRectId !== data.rectId"
                @change="() => handleActionTypeChange(data, setFieldValue)"
              />
            </div>
            <div>
              <BaseFormInput
                v-if="
                  currentActionTypeOption(values[`actionType_${data.rectId}`]).actionValueLabelName
                "
                :label="
                  currentActionTypeOption(values[`actionType_${data.rectId}`]).actionValueLabelName
                "
                :name="`actionValue_${data.rectId}`"
                :placeholder="
                  currentActionTypeOption(values[`actionType_${data.rectId}`]).placeholder || ''
                "
                :rules="
                  currentActionTypeOption(values[`actionType_${data.rectId}`]).value === 'uri'
                    ? 'url'
                    : 'required'
                "
                :inline="false"
                :full-width="true"
                :is-disabled="selectedRectId !== data.rectId"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #btn-text>立即發佈選單</template>
    <template #btn-prepend>
      <img src="/img/deploy.svg" alt="發佈icon" />
    </template>
  </BaseForm>
</template>
