import { reactive } from 'vue'

export interface AreaItem {
  no: number
  x: number
  y: number
  width: number
  height: number
  rectId: number
}

export interface RectManagerState {
  // 圖片
  imageType: string
  // 矩形資訊
  rectanglesInfo: {
    // 圖片原始尺寸
    nativeSize: { width: number; height: number }
    // 調整後圖片尺寸
    baseSize: { width: number; height: number }
    // 矩形座標
    areas: AreaItem[]
  }
  // 基底尺寸設定
  baseWidth: number
  // 顯示圖片的區塊尺寸
  displaySize: readonly [number, number]
  // 正在「編輯/所選」矩形
  selectedRectIndex: number | null
  // 從表單 EditorForm.vue 選「刪除」矩形
  deletedRectKey: number
}

const defaultCanvasSetting = {
  // 顯示圖片的區塊尺寸
  baseWidth: 1040,
  // 畫布基底尺寸設定
  displaySize: [665, 450]
} as const

export const rectState = reactive<RectManagerState>({
  imageType: '',
  rectanglesInfo: {
    nativeSize: { width: 0, height: 0 },
    baseSize: { width: 0, height: 0 },
    areas: []
  },
  baseWidth: defaultCanvasSetting.baseWidth,
  displaySize: defaultCanvasSetting.displaySize,
  selectedRectIndex: null,
  deletedRectKey: 0
})

export function useRectManager() {
  // 變更所選圖片
  const setImageType = (type: string) => {
    rectState.imageType = type
  }

  // 更新矩陣資訊
  const setRectanglesInfo = (info: any) => {
    rectState.rectanglesInfo.nativeSize = info.size
    rectState.rectanglesInfo.baseSize = info.baseSize
    rectState.rectanglesInfo.areas = info.areas
  }

  // 選取矩形(點擊畫布中矩形、表單中的動作)
  const selectArea = (id: number | null) => {
    rectState.selectedRectIndex = id
  }

  // 從表單 EditorForm.vue 按「刪除」
  const triggerDelete = (id: number) => {
    selectArea(id)
    rectState.deletedRectKey = Date.now()
  }

  return {
    setImageType,
    setRectanglesInfo,
    selectArea,
    triggerDelete
  }
}
