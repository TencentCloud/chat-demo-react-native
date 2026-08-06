import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { GroupApplicationList, type GroupApplicationInfo } from '@tencentcloud/chat-uikit-react-native'

export const GroupApplicationListScreen: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleAccept = useCallback(
    (_item: GroupApplicationInfo): void => {
      navigation.goBack()
    },
    [navigation]
  )

  const handleReject = useCallback(
    (_item: GroupApplicationInfo): void => {
      navigation.goBack()
    },
    [navigation]
  )

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.groupApplicationList.title')} onBack={handleBack} />
      <View style={styles.pageContent}>
        <GroupApplicationList onAccept={handleAccept} onReject={handleReject} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageContent: { flex: 1 },
})
