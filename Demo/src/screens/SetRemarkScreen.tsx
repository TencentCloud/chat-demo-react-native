import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { SetRemark } from '@tencentcloud/chat-uikit-react-native'
import type { ContactInfoData } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  SetRemark: { friendInfo?: ContactInfoData }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'SetRemark'>
type Rt = RouteProp<RootStackParamList, 'SetRemark'>

export const SetRemarkScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Rt>()
  const { t } = useTranslation()

  const friendInfo = route.params?.friendInfo ?? null

  const userID = friendInfo?.userID ?? ''
  const remark = friendInfo?.friendRemark ?? ''

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleSuccess = useCallback(
    (_userID: string, _remark: string): void => {
      setTimeout(() => {
        navigation.goBack()
      }, 1500)
    },
    [navigation]
  )

  const handleFail = useCallback((error: any): void => {
    console.error('设置备注失败:', error)
  }, [])

  const handleCancel = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.setRemark.title')} onBack={handleBack} />
      <View style={styles.pageContent}>
        <SetRemark
          userID={userID}
          remark={remark}
          onSuccess={handleSuccess}
          onFail={handleFail}
          onCancel={handleCancel}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F7' },
  pageContent: { flex: 1 },
})
