import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, type NavigationProp } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { AddFriend } from '@tencentcloud/chat-uikit-react-native'
import type { ContactInfoData } from '@tencentcloud/chat-uikit-react-native'

type Nav = NavigationProp<any>

export const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleUserSelect = useCallback(
    (user: ContactInfoData): void => {
      if (!user.isFriend) {
        navigation.navigate('ContactInfo', {
          type: 'addFriend',
          userInfo: user,
        })
      } else {
        navigation.navigate('ContactInfo', {
          type: 'friend',
          friendInfo: user,
        })
      }
    },
    [navigation]
  )

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.addFriend.title')} onBack={handleBack} />
      <View style={styles.pageContent}>
        <AddFriend onUserSelect={handleUserSelect} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageContent: { flex: 1 },
})
