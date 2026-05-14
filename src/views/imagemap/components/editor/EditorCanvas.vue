<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, inject } from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'
import { useRectManager, rectState } from '@/composables/useRectManager'
import type { ModalOptions } from '@/composables/useBaseModal'

const props = defineProps<{
  store: ReturnType<typeof useRectManager>
}>()

const openModal = inject<(options: ModalOptions) => void>('openModal')
const { setRectanglesInfo, selectArea } = props.store

// 畫布座標(未縮放)
const rectangles = ref<any[]>([])
const selectedId = ref<number | null>(null)
// 型態 HTMLElement 表示指向一個 HTML 元素，可能是 <div>、<span> 或其他 DOM 元素。null 是防止初始或未掛載時的 null
const containerRef = ref<HTMLElement | null>(null)
const imgNaturalWidth = ref(0)
const imgNaturalHeight = ref(0)
const adjustedHeight = ref(0)
// 縮放比例（保持比例）
const scale = ref(1)
// 調整後圖片 URL
const adjustedImageUrl = ref('')
// 繪製中使用的變數
let isDrawing = false
let hasMoved = false
let startX = 0
let startY = 0

// 將畫布座標矩形資訊轉為 line api 格式(座標會乘上 scale 表示縮放後座標)
const rectanglesInfo = computed(() => {
  // 顯示圖片的區塊尺寸
  const [dsW, dsH] = rectState.displaySize
  // 基底尺寸設定
  const ratioX = rectState.baseWidth / dsW
  const ratioY = adjustedHeight.value / dsH

  return {
    // 圖片原始尺寸
    size: {
      width: imgNaturalWidth.value,
      height: imgNaturalHeight.value
    },
    // 調整後圖片尺寸
    baseSize: {
      width: rectState.baseWidth,
      height: adjustedHeight.value
    },
    areas: rectangles.value.map((r, index) => ({
      no: index,
      // 將目前畫面上顯示用比例的座標，換算回「真實圖片座標」
      x: Math.round(r.x * ratioX),
      y: Math.round(r.y * ratioY),
      width: Math.round(r.width * ratioX),
      height: Math.round(r.height * ratioY),
      rectId: r.id
    }))
  }
})

// 彙整繪製矩形流程(座標要除以 scale 表示原始（未縮放）座標)
// 滑鼠 mousedown → startDrawing() 被呼叫
//   ↓ 記錄矩形起點 startX/startY (左上角起點)。每個矩形只會有 一組 startX/startY
// mousemove → drawing() 持續更新矩形寬高。currentX/currentY 滑鼠當前位置，隨滑鼠拖動變化動態改變 width/height
// mouseup → endDrawing() 停止繪製，固定矩形

// | 名稱                      | 類型              | 用途                             |
// | ----------------------- | --------------- | ------------------------------ |
// | `e.clientX / e.clientY` | MouseEvent 原生屬性 | 滑鼠在瀏覽器視窗的位置，不能改名               |
// | `e.currentTarget`       | 事件綁定元素          | 這裡是 canvas-container           |
// | `container.left/top`    | DOM 方法回傳        | 容器在瀏覽器的位置                      |
// | `startX/startY`         | number          | 滑鼠在畫布上的起點座標，只在 mousedown 時記錄一次 |
// | `drawing()`             | 函式              | 根據滑鼠移動動態改變矩形寬高                 |

// 開始繪製（只記錄起點座標位置，不立即建立矩形）
// 在 mousedown 瞬間呼叫一次，拖曳過程 (mousemove)不會再呼叫 startDrawing，而是呼叫 drawing()
const startDrawing = (e: MouseEvent) => {
  if (!currentImgUrl.value) return
  // 點在矩形上不重新繪製(如果滑鼠點擊位置在矩形上（或矩形裡的任何子元素），就 不開始繪製新矩形，避免覆蓋或衝突。)
  // .closest() 是 DOM 的方法，用來找最近的符合 CSS 選擇器的父元素（包含自己）
  // vdr 是 vue-draggable-resizable 自動幫每個矩形外層包的 div class 名稱(每個可拖曳矩形的容器都有 .vdr class)
  if ((e.target as HTMLElement).closest('.vdr')) return

  isDrawing = true
  hasMoved = false

  // (1)getBoundingClientRect() 是瀏覽器原生 DOM 方法，取得元素在瀏覽器視窗中的位置和尺寸(算滑鼠在容器裡的位置)，回傳一個物件
  // {
  //   top,    // 元素上邊緣到視窗頂端的距離
  //   left,   // 元素左邊緣到視窗左側的距離
  //   width,  // 元素寬度
  //   height, // 元素高度
  //   right,  // 元素右邊緣到視窗左側的距離
  //   bottom  // 元素下邊緣到視窗頂端的距離
  // }
  // (2)當前滑鼠指標的位置，瞬間捕捉，不是拖曳整段的軌跡。每次 mousemove 或 mousedown 都會更新一個新的 e.clientX、e.clientY
  // e.currentTarget 事件監聽器被綁定的元素，也就是掛上 @mousedown 的 DOM 元素。滑鼠相對的是容器本身，而不是容器裡的子元素。而是元素/容器在瀏覽器視窗（viewport）的位置和大小
  // 所以 container 是 class=canvas-container 的位置與尺寸（畫布容器）
  const container = (e.currentTarget as HTMLElement).getBoundingClientRect()
  // startX 和 startY：把滑鼠在瀏覽器上的位置，換算成相對於畫布容器的座標。滑鼠在畫布上的起點座標(只在 mousedown 時記錄一次)
  // clientX 和 clientY：MouseEvent 原生屬性，在這表示滑鼠在整個瀏覽器視窗的位置
  // clientX：滑鼠當前在 瀏覽器視窗左上角為原點 (0,0) 的水平座標
  // clientY：滑鼠當前在 瀏覽器視窗左上角為原點 (0,0) 的垂直座標
  // container.left / container.top：畫布容器在視窗的位置
  // 兩者差值 = 滑鼠在畫布裡的相對位置。 / scale.value 如果畫布有縮放比例，要把座標換算回原始尺寸。即把縮放後的座標換算回原始尺寸
  startX = (e.clientX - container.left) / scale.value
  startY = (e.clientY - container.top) / scale.value
}

// 繪製中（滑鼠移動才新增矩形）
// 處理「滑鼠移動期間」的邏輯
// 建立矩形的動作只在 hasMoved 從 false 變 true 的第一次移動時發生（避免每次移動都 push 新的矩形）
const drawing = (e: MouseEvent) => {
  // 不是在繪製狀態(使用者沒有按下滑鼠)就跳出
  if (!isDrawing) return

  // 以下是當使用者先按下滑鼠（mousedown → 設 isDrawing = true）才會開始處理滑鼠移動，避免在非繪製時誤建立矩形

  // 取得綁定事件的容器（通常是 canvas-container）在視窗（viewport）中的位置與尺寸（top/left/width/height 等）
  const container = (e.currentTarget as HTMLElement).getBoundingClientRect()
  // 把當前滑鼠在視窗的座標轉成「畫布內座標」並考慮目前縮放 scale.value
  // e.clientX - container.left：當前滑鼠相對容器左側的水平像素位置
  const currentX = (e.clientX - container.left) / scale.value
  // e.clientY - container.top：當前滑鼠相對容器上方的垂直像素位置
  const currentY = (e.clientY - container.top) / scale.value
  // 再除以 scale.value，把顯示上的縮放座標換回原始（未縮放）的座標系，方便後續矩形在內部資料結構中使用「原始尺度」。

  // 檢查是否已經真正移動過滑鼠，避免點一下滑鼠就執行的情況
  if (!hasMoved) {
    // 畫布上最多只能建立20個矩形
    if (rectangles.value.length >= 20) {
      openModal({
        type: 'warning',
        title: '矩形數量超過限制',
        confirmText: '確認'
      })
      // 阻止了滑鼠移動事件繼續觸發 drawing()
      isDrawing = false
      return
    }
    // 第一次真的移動，才建立矩形
    // Date.now()會建立物件 Date。用目前的時間戳（毫秒）當作每個矩形的唯一編號
    const id = Date.now()
    rectangles.value.push({
      id,
      x: startX,
      y: startY,
      width: 1,
      height: 1,
      rectId: 0
    })
    selectedId.value = id
    hasMoved = true
  }

  // 確定開始移動且矩形已建立
  if (hasMoved) {
    // 取得陣列中最後一個矩形（剛剛建立的那個矩形）
    const rect = rectangles.value[rectangles.value.length - 1]
    // 計算矩形的寬與高（以起點為參考）
    // width = 當前滑鼠 x - 起點 x
    rect.width = currentX - startX
    // height = 當前滑鼠 y - 起點 y
    rect.height = currentY - startY

    // 支援反向拖曳(使用者從「從右向左」或「從下向上」拖曳，此時 width 或 height 可能為負)
    // 若 width 為負，代表滑鼠在起點左邊拖動
    if (rect.width < 0) {
      rect.x = currentX
      rect.width = Math.abs(rect.width)
    }
    if (rect.height < 0) {
      rect.y = currentY
      rect.height = Math.abs(rect.height)
    }
  }
}

// 結束繪製
// 滑鼠放開 (mouseup)時執行
const endDrawing = () => {
  updateRectanglesInfo()
  // 阻止了滑鼠移動事件繼續觸發 drawing()
  isDrawing = false
  hasMoved = false
}

// 選取矩形
const selectedRectFun = (id: number) => {
  selectedId.value = id
  selectArea(selectedId.value)
}

// 更新矩形位置
// 傳回來的 x、y 是「已縮放」的值
const updateRectPos = (x: number, y: number, id: number) => {
  const rect = rectangles.value.find((r) => r.id === id)
  if (rect) {
    // 內部 rectangles 資料保持 原始（未縮放）座標所以要把顯示座標除回 scale
    rect.x = x / scale.value
    rect.y = y / scale.value
    updateRectanglesInfo()
  }
}

// 更新矩形大小
const updateRectSize = (x: number, y: number, w: number, h: number, id: number) => {
  const rect = rectangles.value.find((r) => r.id === id)
  if (rect) {
    rect.x = x / scale.value
    rect.y = y / scale.value
    rect.width = w / scale.value
    rect.height = h / scale.value
    rect.rectId = id
    updateRectanglesInfo()
  }
}

// 刪除選中的矩形
const deletedRectFun = () => {
  if (!selectedId.value) return
  openModal({
    type: 'error',
    title: '確認是否刪除此矩形？',
    cancelText: '取消',
    confirmText: '確定',
    onConfirm: () => {
      rectangles.value = rectangles.value.filter((r) => r.id !== selectedId.value)
      selectedId.value = null
      updateRectanglesInfo()
    }
  })
}

// 觸發即時更新資訊
const updateRectanglesInfo = () => {
  // 這裡不用做什麼，因為有用 computed rectanglesInfo 來自動更新
  setRectanglesInfo(rectanglesInfo.value)
}

// 點空白區取消選取
const clearSelection = (e: MouseEvent) => {
  // 如果點到的是矩形 (含 vdr 節點) 就不清除
  if ((e.target as HTMLElement).closest('.vdr')) return

  // 點到空白區塊 → 取消選取
  selectedId.value = null
  selectArea(selectedId.value)
}

// 監聽鍵盤 Delete 和 Backspace 鍵
// KeyboardEvent：鍵盤事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    deletedRectFun()
  }
}

const currentImgUrl = computed(() => {
  return rectState.imageType ? `/img/${rectState.imageType}.png` : ''
})

watch(
  () => currentImgUrl.value,
  (newUrl) => {
    // 沒有圖片 url 時
    if (!newUrl) {
      // 重設圖片原始尺寸
      imgNaturalWidth.value = 0
      imgNaturalHeight.value = 0
      adjustedImageUrl.value = ''
      updateRectanglesInfo()
      return
    }

    // new Image()：建立一個 HTMLImageElement（等同 <img>），但不插入到 DOM
    const img = new Image()
    // 將檔案轉成臨時 URL
    // img.src = newUrl：將圖片來源指向 newUrl
    img.src = newUrl
    // 圖片載入完執行
    img.onload = () => {
      // 取得圖片的原始像素寬、高
      console.dir(img)
      let imgW = img.naturalWidth
      let imgH = img.naturalHeight

      // 設定基底高度：等比縮放到寬度 = 1040
      const ratio = rectState.baseWidth / imgW
      // 用相同比例算出縮放後的高度並四捨五入
      adjustedHeight.value = Math.round(imgH * ratio)

      // 圖片的原始像素寬、高賦值到 ref 變數(應用在 rectanglesInfo 中)
      imgNaturalWidth.value = imgW
      imgNaturalHeight.value = imgH

      // 動態建立一個 HTMLCanvasElement（不插入 DOM，純記憶體操作）
      const canvas = document.createElement('canvas')
      // 設定畫布實際像素大小
      canvas.width = rectState.baseWidth
      canvas.height = adjustedHeight.value
      // 取得繪圖上下文物件（用來操作像素、繪圖）
      // getContext() 是 HTMLCanvasElement 的原生方法，用來取得"繪圖上下文（context）"，2d 表示 2D 繪圖 模式（平面繪圖）
      // canvas.getContext('2d') 就像取得「畫筆」，接下來所有繪圖操作都靠這個 ctx
      const ctx = canvas.getContext('2d')
      // 把 img 以指定寬高繪製到 canvas（做縮放與重繪），來源圖片會被縮放填滿整個 canvas (不管原圖多大，都會自動縮放成 canvas 指定的寬高)
      // drawImage(image, dx, dy, dWidth, dHeight)參數說明如下
      // image：要畫的圖像（HTMLImageElement、HTMLVideoElement、HTMLCanvasElement）
      // dx：圖像在 canvas 上的 左上角 x 座標
      // dy：圖像在 canvas 上的 左上角 y 座標
      // dWidth：在 canvas 上的 寬度（會自動縮放圖像）
      // dHeight：在 canvas 上的 高度（會自動縮放圖像）
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 壓縮生成 JPEG，壓縮品質（0.0 ~ 1.0），0.9 是偏高品質、檔案較大
      let quality = 0.9
      // 把 canvas 的內容轉成 JPEG 格式的 data URL（字串）
      let dataUrl = canvas.toDataURL('image/jpeg', quality)

      // 自動調整壓縮，直到 <= 1 MB
      const maxSize = 1024 * 1024
      // dataUrl 是 Base64 編碼的字串，length 不是精確 bytes。所以用 1.37 乘數是為了把 Base64 長度折算成 bytes
      while (dataUrl.length > maxSize * 1.37 && quality > 0.1) {
        quality -= 0.05
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      adjustedImageUrl.value = dataUrl
      uploadAdjustedImage(dataUrl)
      updateRectanglesInfo()
    }
  },
  { immediate: true }
)

// async 函式一定會回傳 Promise 所以要寫 Promise。因為不會有回傳值（只執行動作，裡面沒有 return 任何東西)，所以要寫 Promise<void>
const uploadAdjustedImage = async (dataUrl: string): Promise<void> => {
  // 將 data URL 轉成 File
  const fileName = rectState.imageType || 'adjusted.jpg'

  // 參數 dataUrl 是圖片的 Base64 Data URL
  // Data URL 是一種特殊協議，瀏覽器可直接解譯並轉成 Blob
  // dataurl 不是一般網址，而是像這樣的 Data URL
  // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
  const file = await dataURLtoFile(dataUrl, fileName)

  // 上傳 API
  // 建立一個 FormData 實例，準備上傳資料
  const formData = new FormData()
  // 把 file 以欄位名稱 'image' 加入 FormData
  formData.append('image', file)
}

// 把 Data URL 轉成 File 物件
// async 函式一定會回傳 Promise 所以要寫 Promise。因為最後是得到一個檔案(return new File(...))，所以要寫 Promise<File>
const dataURLtoFile = async (dataurl: string, filename: string): Promise<File> => {
  // fetch() 是瀏覽器提供的 原生 API，用來進行 HTTP 請求
  // fetch() 看到這個 data URL(如 data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...)，會直接「解析字串 → 轉成 blob」。所以這樣的寫法其實是「把 base64 字串轉成 Blob」的一種簡潔方法
  // fetch(input, init?) 寫法
  // input → 你要請求的資源，例如：網址（'https://example.com'）或像這裡的 data URL（'data:image/png;base64,...'）
  // init → 可選參數，用來設定請求方法、標頭、body 等。
  const res = await fetch(dataurl)
  // 將回傳結果轉成二進位 Blob 物件
  const blob = await res.blob()
  // 把 Blob 封裝成 File 物件，指定檔名與 MIME 類型。這樣就能像一般檔案一樣上傳
  return new File([blob], filename, { type: blob.type })
}

watch(
  () => rectState.selectedRectIndex,
  (newIndex) => {
    if (newIndex !== null) {
      selectedRectFun(newIndex)
    }
  }
)

// 監聽該選項的動態 key，讓 sweetalert 取消刪除後又能對同一個選項執行刪除
watch(
  () => rectState.deletedRectKey,
  () => {
    selectedRectFun(rectState.selectedRectIndex)
    deletedRectFun()
  }
)

onMounted(() => {
  // 監聽鍵盤，在 handleKeydown 有定義監聽 Delete 和 Backspace 鍵
  window.addEventListener('keydown', handleKeydown)
  // 檢查 containerRef.value 是否存在，也就是 畫布容器 DOM 是否已掛載
  if (containerRef.value) {
    // 當畫布容器 containerRef 尺寸改變時，會呼叫函式 updateScale() 來更新繪製矩形的縮放比例，保持與容器大小同步
    // ro 是建立一個 ResizeObserver 監聽器
    // ResizeObserver 是原生 API，用來監控某個 DOM 元素大小變化
    const ro = new ResizeObserver(() => {
      updateScale()
    })
    // 觀察 containerRef.value 這個 DOM 元素的尺寸變化
    ro.observe(containerRef.value)
  }
})

// 組件即將被卸載、移除 DOM 之前執行
onBeforeUnmount(() => {
  // 移除事件監聽器，減少記憶體泄漏 或 多餘觸發
  window.removeEventListener('keydown', handleKeydown)
})

// 更新比例
const updateScale = () => {
  // 檢查畫布容器 DOM 是否掛載 或 是否定義顯示圖片的區塊尺寸
  if (!containerRef.value || !rectState.displaySize) return
  // 取得 畫布容器當前的寬度與高度
  const cw = containerRef.value.clientWidth
  const ch = containerRef.value.clientHeight
  // 寬度、高度縮放比例
  const sx = cw / rectState.displaySize[0]
  const sy = ch / rectState.displaySize[1]
  scale.value = Math.min(sx, sy) // 使用最小比例保持縱橫比
}
</script>

<template>
  <div>
    <p v-if="!adjustedImageUrl" class="font-semibold">請先選擇圖片</p>
  </div>
  <div>
    <!-- mousedown(滑鼠按鍵被按下去的那一瞬間)：開始繪製矩形 -->
    <!-- mousemove(滑鼠移動時，每移動一點就會觸發一次)：拖曳繪製中 -->
    <!-- mouseup(滑鼠按鍵放開時)：結束繪製 -->
    <!-- ref="containerRef"：讓 JS 可以取得這個 DOM 物件 -->
    <!-- canvas-container 是畫布區域=圖片 -->
    <div
      ref="containerRef"
      class="canvas-container"
      :style="{
        width: rectState.displaySize[0] + 'px',
        height: rectState.displaySize[1] + 'px'
      }"
      @mousedown="
        (e) => {
          clearSelection(e)
          startDrawing(e)
        }
      "
      @mousemove="drawing"
      @mouseup="endDrawing"
    >
      <!-- 經過壓縮與調整尺寸後的圖片 -->
      <!-- draggable="false" 禁止瀏覽器內建拖曳 -->
      <img v-if="adjustedImageUrl" :src="adjustedImageUrl" draggable="false" class="bg-img" />
      <!-- 每個矩形的座標與尺寸都會乘上目前縮放比例 scale -->
      <!-- 當矩形被點選會觸發 @activated -->
      <vue-draggable-resizable
        v-for="rect in rectangles"
        :key="rect.id"
        :x="rect.x * scale"
        :y="rect.y * scale"
        :w="Math.max(1, rect.width * scale)"
        :h="Math.max(1, rect.height * scale)"
        :active="selectedId === rect.id"
        :parent="true"
        @activated="selectedRectFun(rect.id)"
        @dragging="(x, y) => updateRectPos(x / scale, y / scale, rect.id)"
        @resizing="
          (x, y, w, h) => updateRectSize(x / scale, y / scale, w / scale, h / scale, rect.id)
        "
      >
        <div class="rect-content" :class="{ active: selectedId === rect.id }"></div>
      </vue-draggable-resizable>
    </div>
  </div>
</template>
<!-- vue-draggable-resizable 套件（例如 v3 或 v4 版本）的事件
 | 事件名稱        | 觸發時機  | 說明                              |
| --------------- | --------- | ------------------------------   |
| `@drag-start`   | 開始拖曳時 | 滑鼠按下並開始移動時                |
| `@dragging`     | 拖曳過程中 | 拖曳時持續觸發（會回傳目前座標）     |
| `@drag-stop`    | 拖曳結束時 | 放開滑鼠後觸發                     |
| `@resize-start` | 開始縮放時 | 拖曳角落或邊緣開始改變大小時        |
| `@resizing`     | 縮放過程中 | 正在改變大小時持續觸發（會回傳寬高） |
| `@resize-stop`  | 結束縮放時 | 放開滑鼠後觸發                     |
 -->

<!-- vue-draggable-resizable 屬性
pageAction 是專案中設定的表示預覽情境
| 屬性                                                             | 功能       | 說明         |
| -------------------------------------------------------------- | -------- | ---------- |
| `:draggable="pageAction !== 'preview'"`                        | 禁止拖曳     | 預覽時不允許改變位置 |
| `:resizable="pageAction !== 'preview'"`                        | 禁止縮放     | 預覽時不允許改變大小 |
| `:active="selectedId === rect.id && pageAction !== 'preview'"` | 停用紫框選取效果 | 預覽時不高亮框線   |
-->

<style scoped>
.canvas-container {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 裁切填滿 */
  object-position: left top; /* 裁切基準從左上角開始 */
  user-select: none;
  pointer-events: none;
}

.rect-content {
  width: 100%;
  height: 100%;
  background-color: rgb(148, 163, 184, 0.5);
  border: 1px solid #94a3b8;
}

/* 被選中的矩形套用紫色 */
.rect-content.active {
  background-color: rgba(79, 70, 229, 0.2);
  border: 1px solid #818cf8;
}

.toolbar {
  margin-top: 10px;
}

/* 節點改成圓形 */
:deep(.handle) {
  /* 圓形 */
  border-radius: 50% !important;
  /* 節點大小 */
  width: 10px !important;
  height: 10px !important;
  /* 邊框 */
  border: 1px solid #818cf8 !important;
  background-color: #818cf8;
}

/* 調整每個節點位置 */
:deep(.handle-mr),
:deep(.handle-tr),
:deep(.handle-br) {
  right: -5px !important;
}

:deep(.handle-tr),
:deep(.handle-tm),
:deep(.handle-tl) {
  top: -5px !important;
}

:deep(.handle-tl),
:deep(.handle-bl),
:deep(.handle-ml) {
  left: -5px !important;
}

:deep(.handle-br),
:deep(.handle-bm),
:deep(.handle-bl) {
  bottom: -5px !important;
}
</style>
