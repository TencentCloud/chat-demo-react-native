import React, { useEffect, useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, showToast} from '@tencentcloud/chat-uikit-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { useLoginState } from 'tuikit-atomicx-react-native'
import { genTestUserSig } from './debug/GenerateTestUserSig'
import { setDemoLanguage } from './i18n'

type RootStackParamList = {
  Login: undefined
  Main: undefined
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>

const LANG_STORAGE_KEY = '@demo:language'

type LanguageOption = 'zh-CN' | 'en'

const resolveCurrentLang = (i18nLang: string): LanguageOption => {
  return i18nLang === 'en' ? 'en' : 'zh-CN'
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const { login, logout, loginStatus, loginUserInfo } = useLoginState()

  const [userID, setUserID] = useState('') // userID
  const SDKAppID = '' // SDKAppID
  const SecretKey = '' // SecretKey

  const LOGIN_STATUS_LOGINED = 1

  useEffect((): void => {
    void (async (): Promise<void> => {
      try {
        const saved: string | null = await AsyncStorage.getItem(LANG_STORAGE_KEY)
        if (saved === 'zh-CN' || saved === 'en') {
          setDemoLanguage(saved)
        }
      } catch {}
    })()
  }, [])

  useEffect((): void => {
    if (loading && loginStatus === LOGIN_STATUS_LOGINED) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    }
  }, [loading, loginStatus, navigation])

  const handleLanguageChange = (lang: LanguageOption): void => {
    setDemoLanguage(lang)
    void AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
  }

  const currentLang: LanguageOption = resolveCurrentLang(i18n.language)
  const validate = (): string | null => {
    if (!userID.trim()) {
      return t('demo.login.userIdEmpty')
    }
    return null
  }

  const doLogin = async (): Promise<void> => {
    setLoading(true)
    try {
      await login({
        sdkAppID: Number(SDKAppID),
        userID: userID.trim(),
        userSig: genTestUserSig({
          SDKAppID: Number(SDKAppID),
          userID: userID.trim(),
          SecretKey: SecretKey
        }).userSig,
      })
    } catch (error: any) {
      showToast(`${t('demo.login.loginFailed')}\n${error?.message ?? t('demo.login.unknownError')}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (): Promise<void> => {
    const err = validate()
    if (err) {
      showToast(`${err}`)
      return
    }

    const isLoggedIn: boolean = loginStatus === LOGIN_STATUS_LOGINED
    const currentLoggedInUserID: string = loginUserInfo?.userID ?? ''
    const isSameUser: boolean = isLoggedIn && currentLoggedInUserID === userID.trim()

    if (isSameUser) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
      return
    }

    if (isLoggedIn) {
      try {
        await logout()
        await doLogin()
      } catch (error: any) {
        showToast(`${t('demo.login.switchingAccount')}\n${error?.message ?? t('demo.login.unknownError')}`)
      }
      return
    }

    await doLogin()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('demo.login.title')}</Text>
            <Text style={styles.subtitle}>{t('demo.login.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Field
              label={t('demo.login.userIdLabel')}
              value={userID}
              onChangeText={setUserID}
              placeholder={t('demo.login.userIdPlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            activeOpacity={0.7}
            disabled={loading}
            onPress={() => {
              void handleLogin()
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('demo.login.loginButton')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.langSection}>
            <Text style={styles.langLabel}>{t('demo.language.label')}</Text>
            <View style={styles.langButtonGroup}>
              <LangOption
                active={currentLang === 'zh-CN'}
                label={t('demo.language.zhCN')}
                onPress={(): void => handleLanguageChange('zh-CN')}
              />
              <LangOption
                active={currentLang === 'en'}
                label={t('demo.language.en')}
                onPress={(): void => handleLanguageChange('en')}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Field: React.FC<{
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'number-pad'
  autoCapitalize?: 'none' | 'sentences'
  autoCorrect?: boolean
  secureTextEntry?: boolean
  multiline?: boolean
  editable?: boolean
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize,
  autoCorrect,
  secureTextEntry,
  multiline,
  editable = true,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMulti, !editable && styles.inputReadonly]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#B8B8B8"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      editable={editable}
    />
  </View>
)

const LangOption: React.FC<{
  active: boolean
  label: string
  onPress: () => void
}> = ({ active, label, onPress }) => (
  <TouchableOpacity
    style={[styles.langOption, active && styles.langOptionActive]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Text style={[styles.langOptionText, active && styles.langOptionTextActive]}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  form: { marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputReadonly: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#1F66FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  help: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
  langSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  langLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  langButtonGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  langOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  langOptionActive: {
    backgroundColor: '#1F66FF',
  },
  langOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  langOptionTextActive: {
    color: '#FFFFFF',
  },
  langCurrent: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
})
