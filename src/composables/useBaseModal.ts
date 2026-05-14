import { reactive } from 'vue'

export interface ModalOptions {
  type?: 'success' | 'error' | 'warning'
  title?: string
  content?: string
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
}

// 狀態管理
export const modalState = reactive<ModalOptions & { isOpen: boolean }>({
  isOpen: false,
  type: undefined,
  title: undefined,
  content: undefined,
  cancelText: undefined,
  confirmText: undefined,
  onConfirm: () => {}
})

export const showModal = (options: ModalOptions) => {
  // 將傳入的選項 options 更新到狀態 modalState，並打顯示彈窗
  modalState.isOpen = true
  modalState.type = options.type
  modalState.title = options.title
  modalState.content = options.content
  modalState.cancelText = options.cancelText
  modalState.confirmText = options.confirmText
  modalState.onConfirm = options.onConfirm || (() => {})
}

export const closeModal = () => {
  modalState.isOpen = false
}
