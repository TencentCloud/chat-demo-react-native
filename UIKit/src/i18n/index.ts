import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en, type TranslationKeys } from './en'
import { zhCN } from './zh-CN'

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
} as const

let _initialized = false
let _defaultLanguage: 'en' | 'zh-CN' = 'zh-CN'

const _ensureInit = (): void => {
  if (_initialized) return
  void i18n.use(initReactI18next).init({
    resources,
    lng: _defaultLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  })
  _initialized = true
}

export const initI18n = (defaultLanguage: 'en' | 'zh-CN' = 'zh-CN'): void => {
  _defaultLanguage = defaultLanguage
  _ensureInit()
}

export const setLanguage = (lng: 'en' | 'zh-CN' | string): void => {
  _ensureInit()
  void i18n.changeLanguage(lng)
}

export const registerLanguage = (lng: string, translations: TranslationKeys): void => {
  _ensureInit()
  i18n.addResourceBundle(lng, 'translation', translations, true, true)
}

export const getI18n = (): typeof i18n => {
  _ensureInit()
  return i18n
}

export const getCurrentLanguage = (): string => {
  _ensureInit()
  return i18n.language
}

export { en, zhCN }
export type { TranslationKeys }
