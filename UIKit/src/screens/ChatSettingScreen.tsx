import React, { useCallback } from 'react'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import {
  C2CChatSetting,
  GroupChatSetting,
} from '@tencentcloud/chat-uikit-react-native'
import type { UserPickerType as ChatSettingUserPickerType } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  ChatSetting: { conversationID: string; type: 'C2C' | 'GROUP'; showType?: number }
  GroupMemberList: { conversationID: string; hideMember?: boolean }
  GroupManagement: { conversationID: string }
  UserPicker: { businessType: ChatSettingUserPickerType; routeParams?: Record<string, any> }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'ChatSetting'>

export const ChatSettingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<RouteProp<RootStackParamList, 'ChatSetting'>>()
  const { t } = useTranslation()
  const { conversationID, type, showType } = route.params

  const isC2C = conversationID?.startsWith('c2c_')
  const isGroup = conversationID?.startsWith('group_')

  const navTitle = isC2C
    ? t(showType === 0 ? 'demo.screens.chatSetting.title.c2cProfile' : 'demo.screens.chatSetting.title.c2c')
    : t('demo.screens.chatSetting.title.group')

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleNavigateToMemberList = useCallback(
    (convID: string): void => {
      navigation.navigate('GroupMemberList', { conversationID: convID })
    },
    [navigation]
  )

  const handleNavigateToGroupManagement = useCallback(
    (convID: string): void => {
      navigation.navigate('GroupManagement', { conversationID: convID })
    },
    [navigation]
  )

  const handleNavigateToUserPicker = useCallback(
    (info: { businessType: ChatSettingUserPickerType; conversationID: string; onGroupMemberChanged?: (info: { type: 'add' | 'remove'; groupID: string; count: number }) => void }): void => {
      const TRANSFER_GROUP_OWNER = 9
      const routeParams: Record<string, any> = { conversationID: info.conversationID }
      if (info.businessType === (TRANSFER_GROUP_OWNER as ChatSettingUserPickerType)) {
        routeParams.onGroupOwnerChanged = (): void => {
          navigation.goBack()
        }
      }
      if (info.onGroupMemberChanged) {
        routeParams.onGroupMemberChanged = info.onGroupMemberChanged
      }
      navigation.navigate('UserPicker', {
        businessType: info.businessType,
        routeParams,
      })
    },
    [navigation]
  )

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={navTitle} onBack={handleBack} />
      {isC2C ? (
        <C2CChatSetting
          conversationID={conversationID}
          showType={showType ?? 0}
          onBack={handleBack}
        />
      ) : isGroup ? (
        <GroupChatSetting
          conversationID={conversationID}
          onBack={handleBack}
          onNavigateToMemberList={handleNavigateToMemberList}
          onNavigateToGroupManagement={handleNavigateToGroupManagement}
          onNavigateToUserPicker={handleNavigateToUserPicker}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
})
