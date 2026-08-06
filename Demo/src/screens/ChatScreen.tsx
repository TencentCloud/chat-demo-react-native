import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { MessageList, MessageInput, type MessageInfo, showToast} from '@tencentcloud/chat-uikit-react-native'
import {
  useConversationListState,
  useGroupState,
  useLoginState,
} from 'tuikit-atomicx-react-native'

const MessageType = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4,
  FILE: 5,
  CUSTOM: 6,
} as const

interface OfflinePushContext {
  messageType: number
  messagePayload: any
  conversationID: string
}

interface OfflinePushInfo {
  title: string
  description: string
  extensionInfo: {
    ext: string
  }
}

type RootStackParamList = {
  Chat: {
    conversationID: string
    type: 'C2C' | 'GROUP'
    title?: string
    locateMessage?: MessageInfo | null
  }
  ChatSetting: { conversationID: string; type: 'C2C' | 'GROUP' }
  ConversationList: undefined
  Login: undefined
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'Chat'>
type Rt = RouteProp<RootStackParamList, 'Chat'>

export const ChatScreen: React.FC = () => {
  const route = useRoute<Rt>()
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const { conversationID, type, locateMessage: initialLocateMessage } = route.params
  const [locateMessage, setLocateMessage] = useState<MessageInfo | null>(initialLocateMessage ?? null)

  const { loginUserInfo } = useLoginState()
  const { joinedGroupList, loadJoinedGroups } = useGroupState()
  const convState = useConversationListState()
  const [inputToolbarHeight, setInputToolbarHeight] = useState(0)
  const [inputPanelHeight, setInputPanelHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [currentConversation, setCurrentConversation] = useState<any>(null)

  const messageInputRef = useRef<any>(null)
  const messageListRef = useRef<any>(null)
  const handleMessageInputFocus = useCallback((): void => {
    messageListRef.current?.scrollToBottom?.()
  }, [])

  const isXiaomi12 = useMemo((): boolean => {
    if (Platform.OS !== 'android') return false
    const c = Platform.constants as { Brand?: string; Manufacturer?: string; Model?: string } | null
    if (c == null) return false
    const brand = (c.Brand ?? c.Manufacturer ?? '').toLowerCase()
    const model = c.Model ?? ''
    return brand.includes('xiaomi') && /^22011(22|23)/.test(model)
  }, [])

  const isC2CConversation = useMemo(() => conversationID.startsWith('c2c_'), [conversationID])
  const navigationTitle = useMemo(
    () => currentConversation?.title ?? t(isC2CConversation ? 'demo.screens.chat.title.default' : 'demo.screens.chat.title.group'),
    [currentConversation, t, isC2CConversation]
  )

  const refreshConversationInfo = useCallback(async (): Promise<void> => {
    if (!conversationID) return
    try {
      const info = await convState.getConversationInfo(conversationID)
      if (info != null) {
        setCurrentConversation(info)
      }
    } catch (e) {
      console.error('[chat] getConversationInfo failed:', e)
    }
  }, [conversationID, convState.getConversationInfo])

  const onNavBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const onNavMenuSelect = useCallback((): void => {
    if (!isC2CConversation) {
      const groupID = conversationID.replace('group_', '')
      const isInGroup = joinedGroupList.some((g: any) => g.groupID === groupID)
      if (!isInGroup) {
        showToast(`${t('demo.screens.chat.notInGroupTip')}\n${t('demo.screens.chat.notInGroup')}`)
        return
      }
    }
    navigation.navigate('ChatSetting', { conversationID, type })
  }, [isC2CConversation, conversationID, joinedGroupList, navigation, type])

  const onMessageInputHeightChange = useCallback(
    (data: { inputToolbarHeight: number; inputPanelHeight: number }): void => {
      setInputToolbarHeight(data.inputToolbarHeight)
      setInputPanelHeight(data.inputPanelHeight)
    },
    []
  )

  useEffect(() => {
    const onShow = (e: { endCoordinates: { height: number } }): void => {
      setKeyboardHeight(e.endCoordinates.height)
    }
    const onHide = (): void => {
      setKeyboardHeight(0)
    }
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShow
    )
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHide
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const closeSoftKeyboard = useCallback((): void => {
    messageInputRef.current?.collapse?.()
  }, [])

  const setOfflinePushInfo = useCallback(
    (ctx: OfflinePushContext): OfflinePushInfo | null => {
      const title = isC2CConversation
        ? (loginUserInfo?.nickname ?? loginUserInfo?.userID ?? '新消息')
        : (currentConversation?.title ?? '新消息')
      const conv = ctx.conversationID
      let description = '[新消息]'
      switch (ctx.messageType) {
        case MessageType.TEXT:
          description = (ctx.messagePayload as { text?: string })?.text || '[文本消息]'
          break
        case MessageType.IMAGE:
          description = '[图片]'
          break
        case MessageType.VIDEO:
          description = '[视频]'
          break
        case MessageType.AUDIO:
          description = '[语音]'
          break
        case MessageType.FILE:
          description = '[文件]'
          break
        case MessageType.CUSTOM:
          return null
        default:
          return null
      }
      return {
        title,
        description,
        extensionInfo: {
          ext: JSON.stringify({ conversationID: conv, messageType: ctx.messageType }),
        },
      }
    },
    [isC2CConversation, loginUserInfo, currentConversation]
  )

  useEffect(() => {
    void loadJoinedGroups()
  }, [loadJoinedGroups])

  useFocusEffect(
    useCallback(() => {
      void refreshConversationInfo()
    }, [refreshConversationInfo])
  )

  const messageListPaddingBottom = inputToolbarHeight + inputPanelHeight + keyboardHeight

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={[
          styles.kavRoot,
          isXiaomi12 ? { paddingBottom: keyboardHeight } : null,
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <CustomNavbar
          title={navigationTitle}
          onBack={onNavBack}
          rightText="⋯"
          onRightPress={onNavMenuSelect}
        />

        <TouchableWithoutFeedback onPress={closeSoftKeyboard}>
          <View style={styles.messageListContainer}>
            <MessageList
              ref={messageListRef}
              conversationID={conversationID}
              locateMessage={locateMessage}
              bottomInset={messageListPaddingBottom}
              onMessageListTap={closeSoftKeyboard}
            />
          </View>
        </TouchableWithoutFeedback>

        <MessageInput
          ref={messageInputRef}
          conversationID={conversationID}
          onHeightChange={onMessageInputHeightChange}
          setOfflinePushInfo={setOfflinePushInfo}
          onFocus={handleMessageInputFocus}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  kavRoot: {
    flex: 1,
  },
  messageListContainer: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
})
