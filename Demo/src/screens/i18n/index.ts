import { getI18n } from '@tencentcloud/chat-uikit-react-native'
import { demoZhCN } from './zh-CN'
import { demoEn } from './en'

let _demoRegistered = false

export const registerDemoI18n = (defaultLanguage: 'en' | 'zh-CN' = 'zh-CN'): void => {
  if (_demoRegistered) return
  const i18n = getI18n()
  i18n.addResourceBundle('zh-CN', 'translation', demoZhCN, true, true)
  i18n.addResourceBundle('en', 'translation', demoEn, true, true)
  if (i18n.language !== defaultLanguage) {
    void i18n.changeLanguage(defaultLanguage)
  }
  _demoRegistered = true
}

export const setDemoLanguage = (lng: 'en' | 'zh-CN' | string): void => {
  if (!_demoRegistered) registerDemoI18n()
  void getI18n().changeLanguage(lng)
}

export const getCurrentDemoLanguage = (): string => getI18n().language

export const getDemoI18n = () => getI18n()

export type DemoTranslationKeys = typeof demoEn
