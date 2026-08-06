import React, { useCallback, useMemo } from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Search, type SearchOption } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  SearchInConversation: { conversationID: string; keyword?: string; option?: string }
  Chat: { conversationID: string; type: 'C2C' | 'GROUP'; locateMessage?: any }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'SearchInConversation'>
type Rt = RouteProp<RootStackParamList, 'SearchInConversation'>

const STATUS_BAR_HEIGHT = Platform.OS === 'ios'
  ? 44
  : (StatusBar.currentHeight ?? 24)

export const SearchInConversationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Rt>()
  const { t } = useTranslation()
  const { conversationID, keyword: encodedKeyword, option: encodedOption } = route.params

  const initialKeyword = useMemo(() => {
    if (!encodedKeyword) return ''
    try {
      return decodeURIComponent(encodedKeyword)
    } catch (e) {
      return ''
    }
  }, [encodedKeyword])

  const initialOption = useMemo<SearchOption>(() => {
    if (!encodedOption) return {}
    try {
      return JSON.parse(decodeURIComponent(encodedOption)) as SearchOption
    } catch (e) {
      console.error('[SearchInConversation] Parse option failed:', e)
      return {}
    }
  }, [encodedOption])

  const statusBarHeight = STATUS_BAR_HEIGHT

  const handleSearch = useCallback((_keyword: string, _option: SearchOption): void => {
  }, [])

  const handleCancel = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleResultItemClick = useCallback(
    (type: string, data: any): void => {
      if (type === 'message') {
        navigation.navigate('Chat', {
          conversationID,
          type: conversationID.startsWith('group_') ? 'GROUP' : 'C2C',
          locateMessage: data,
        })
      }
    },
    [conversationID, navigation]
  )

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.searchPage, { paddingTop: statusBarHeight }]}>
        <Search
          conversationID={conversationID}
          initialKeyword={initialKeyword}
          initialOption={initialOption}
          placeholder={t('demo.screens.searchInConversation.placeholder')}
          showCancel
          debounceTime={300}
          onSearch={handleSearch}
          onCancel={handleCancel}
          onResultItemClick={handleResultItemClick}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  searchPage: { flex: 1, backgroundColor: '#FFFFFF' },
})
