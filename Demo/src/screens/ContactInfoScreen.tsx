import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { ContactInfo, type ContactInfoData, type ContactInfoType, type FriendApplicationInfo } from '@tencentcloud/chat-uikit-react-native'

interface UserInfo {
  userID: string
  nickname?: string
  avatarURL?: string
  signature?: string
  isFriend?: boolean
  allowType?: number
}

type RootStackParamList = {
  ContactInfo: {
    type?: ContactInfoType
    userInfo?: any
    friendInfo?: any
    applicationInfo?: any
  }
  ApplicationVerify: { type: 'friend' | 'group'; userInfo?: any; groupInfo?: any }
  Chat: { conversationID: string; type: 'C2C' | 'GROUP' }
  SetRemark: { friendInfo?: ContactInfoData }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'ContactInfo'>
type Rt = RouteProp<RootStackParamList, 'ContactInfo'>

export const ContactInfoScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Rt>()
  const { t } = useTranslation()
  const { type, userInfo: initialUserInfo, friendInfo: initialFriendInfo, applicationInfo } = route.params

  const userInfo: UserInfo | null = (initialUserInfo as UserInfo | undefined) ?? null
  const friendInfo: ContactInfoData | null = (initialFriendInfo as ContactInfoData | undefined) ?? null
  const friendApplication: FriendApplicationInfo | null =
    (applicationInfo as FriendApplicationInfo | undefined) ?? null
  const canAddFriend = true

  const navTitle = useMemo(() => {
    switch (type) {
      case 'addFriend':
        return t('demo.screens.contactInfo.title.addFriend')
      case 'newContact':
        return t('demo.screens.contactInfo.title.newContact')
      case 'friend':
        return t('demo.screens.contactInfo.title.friend')
      default:
        return t('demo.screens.contactInfo.title.default')
    }
  }, [t, type])

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleAddFriend = useCallback(
    (user: UserInfo): void => {
      navigation.navigate('ApplicationVerify', { type: 'friend', userInfo: user })
    },
    [navigation]
  )

  const handleAcceptFriend = useCallback((): void => {
    if (navigation.canGoBack()) navigation.goBack()
    if (navigation.canGoBack()) navigation.goBack()
  }, [navigation])

  const handleRejectFriend = useCallback((): void => {
    if (navigation.canGoBack()) navigation.goBack()
    if (navigation.canGoBack()) navigation.goBack()
  }, [navigation])

  const handleSendMessage = useCallback(
    (userID: string): void => {
      navigation.navigate('Chat', { conversationID: `c2c_${userID}`, type: 'C2C' })
    },
    [navigation]
  )

  const handleRemarkChange = useCallback(
    (_data: ContactInfoData): void => {
      navigation.navigate('SetRemark', { friendInfo: friendInfo ?? undefined })
    },
    [navigation, friendInfo]
  )

  const handleDeleteFriend = useCallback((): void => {
    console.log('删除好友')
    if (navigation.canGoBack()) navigation.goBack()
  }, [navigation])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={navTitle} onBack={handleBack} />
      <View style={styles.pageContent}>
        <ContactInfo
          type={type}
          userInfo={userInfo}
          friendInfo={friendInfo}
          friendApplication={friendApplication}
          canAddFriend={canAddFriend}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
          onRejectFriend={handleRejectFriend}
          onSendMessage={handleSendMessage}
          onRemarkEdit={handleRemarkChange}
          onDeleteFriend={handleDeleteFriend}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageContent: { flex: 1 },
})
