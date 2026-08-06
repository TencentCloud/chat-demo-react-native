import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@tencentcloud/chat-uikit-react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  UserFilter: { keyword?: string }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'UserFilter'>
type Rt = RouteProp<RootStackParamList, 'UserFilter'>

export const UserFilterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Rt>()
  const { t } = useTranslation()

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.userFilter.title')} onBack={handleBack} />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          UserFilter 屏（待 1:1 转化 userFilter.nvue）
          {'\n'}
          keyword: {route.params?.keyword ?? ''}
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
})
