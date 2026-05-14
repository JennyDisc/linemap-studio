import { defineRule } from 'vee-validate'

defineRule('required', (value: any) => {
  if (!value || !value.length) {
    return '此為必填欄位'
  }
  return true
})

defineRule('url', (value: string) => {
  if (
    !/^(https:\/\/www\.|https:\/\/)?[a-z0-9]+([-]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
      value
    )
  ) {
    return '請輸入有效的 HTTPS 網址'
  }
  return true
})
