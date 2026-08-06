import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { ApplicationVerify } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  ApplicationVerify: {
    type: 'friend' | 'group'
    userInfo?: any
    groupInfo?: any
  }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'ApplicationVerify'>
type Rt = RouteProp<RootStackParamList, 'ApplicationVerify'>

export const ApplicationVerifyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Rt>()
  const { t } = useTranslation()
  const { type, userInfo, groupInfo } = route.params

  const navTitle = useMemo(
    () => t(type === 'friend' ? 'demo.screens.applicationVerify.title.friend' : 'demo.screens.applicationVerify.title.group'),
    [t, type]
  )

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleSuccess = useCallback(
    (successType: 'friend' | 'group', data: any): void => {
      setTimeout(() => {
        const index = successType === 'friend' ? 2 : 1
        for (let i = 0; i < index; i++) {
          if (navigation.canGoBack()) {
            navigation.goBack()
          }
        }
      }, 1500)
    },
    [navigation]
  )

  const handleFail = useCallback((_type: 'friend' | 'group', error: any): void => {
    console.error('申请发送失败:', error)
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={navTitle} onBack={handleBack} />
      <View style={styles.pageContent}>
        <ApplicationVerify
          type={type}
          userInfo={userInfo}
          groupInfo={groupInfo}
          onSuccess={handleSuccess}
          onFail={handleFail}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageContent: { flex: 1 },
})
