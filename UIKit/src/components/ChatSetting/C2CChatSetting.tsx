import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import {
  useContactState,
  useConversationListState,
  ReceiveMessageOpt,
} from 'tuikit-atomicx-react-native'
import { Avatar } from '../Avatar/Avatar'
import { rpxToPx } from '../../utils/rpxToPx'
import { ButtonCell, NavigateCell, ToggleCell } from '../Cell'
import { TextInputPopup } from '../TextInputPopup/TextInputPopup'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import type { ContactInfo, ConversationInfo } from './types/contact'
import { showToast } from '../../utils'

export interface C2CChatSettingProps {
  conversationID: string
  showType?: number
  onBack?: () => void
}

export const C2CChatSetting: React.FC<C2CChatSettingProps> = ({
  conversationID,
  showType = 0,
  onBack,
}) => {
  const { t } = useTranslation()

  
  const userID = useMemo<string>(
    () => (conversationID.startsWith('c2c_') ? conversationID.replace('c2c_', '') : ''),
    [conversationID]
  )

  
  
  
  const contactState = useContactState('c2cSetting')
  const convListState = useConversationListState('c2cSetting')

  
  
  
  const [userInfo, setUserInfo] = useState<ContactInfo | null>(null)
  const [currentConversation, setCurrentConversation] = useState<ConversationInfo | null>(null)
  const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true)
  const [showRemarkPopup, setShowRemarkPopup] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  
  
  
  const friendList: any[] = Array.isArray(contactState.friendList) ? (contactState.friendList as any[]) : []
  const blackList: any[] = Array.isArray(contactState.blackList) ? (contactState.blackList as any[]) : []

  const friendRemark = useMemo<string>(() => {
    const fromFriend = friendList.find((f) => f?.userID === userID)?.friendRemark
    return fromFriend || userInfo?.friendRemark || ''
  }, [friendList, userID, userInfo])

  const isFriend: boolean = userInfo?.isFriend ?? false
  const isInBlacklist: boolean = useMemo(() => {
    const inBL = blackList.find((f) => f?.userID === userID)
    return !!inBL || userInfo?.isInBlacklist === true
  }, [blackList, userID, userInfo])

  const isNotDisturb: boolean = useMemo(() => {
    const opt = currentConversation?.receiveOption
    if (opt === undefined) return false
    return opt !== ReceiveMessageOpt.RECEIVE
  }, [currentConversation])

  
  
  
  const fetchPeerUserInfo = async (): Promise<void> => {
    if (!userID) return
    try {
      const list: any[] = await contactState.getContactInfo([userID])
      if (Array.isArray(list) && list.length > 0) {
        const first = list[0]
        setUserInfo({
          userID: first.userID ?? userID,
          nickname: first.nickname,
          friendRemark: first.friendRemark,
          avatarURL: first.avatarURL,
          aboutMe: first.aboutMe,
          isFriend: first.isFriend,
          isInBlacklist: first.isInBlacklist,
        })
      }
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] fetchPeerUserInfo failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const fetchConversationInfo = async (): Promise<void> => {
    if (!conversationID) return
    try {
      const info: any = await convListState.getConversationInfo(conversationID)
      if (info) {
        setCurrentConversation({
          conversationID: info.conversationID,
          showName: info.showName,
          conversationType: info.conversationType,
          receiveOption: info.receiveOption,
          isPinned: info.isPinned,
          unreadCount: info.unreadCount,
          markList: info.markList,
        })
      }
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] fetchConversationInfo failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  useEffect((): (() => void) | void => {
    if (!userID) return
    if (currentConversation != null) {
      setIsFirstLoading(false)
      return
    }
    void fetchPeerUserInfo()
    
    void fetchConversationInfo().then((): void => {
      setIsFirstLoading(false)
    })
    return undefined
    
  }, [userID, conversationID])

  
  
  

  const handleRemarkClick = (): void => {
    setShowRemarkPopup(true)
  }

  const handleRemarkConfirm = async (newRemark: string): Promise<void> => {
    if (!userID) return
    try {
      await contactState.setFriendRemark(userID, newRemark)
      await fetchPeerUserInfo()
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] setFriendRemark failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleNotDisturbChange = async (value: boolean): Promise<void> => {
    if (!userID) return
    try {
      const opt: number = value ? ReceiveMessageOpt.NOT_NOTIFY : ReceiveMessageOpt.RECEIVE
      await convListState.setReceiveMessageOpt(`c2c_${userID}`, opt)
      await fetchConversationInfo()
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] setReceiveMessageOpt failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleBlacklistChange = async (value: boolean): Promise<void> => {
    if (!userID) return
    try {
      if (value) {
        await contactState.addToBlacklist(userID)
      } else {
        await contactState.removeFromBlacklist(userID)
      }
      await fetchPeerUserInfo()
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] blacklist operation failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleSendMessage = (): void => {
    if (showType === 0) {
      
      onBack?.()
    }
  }

  const handleDeleteFriendClick = (): void => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = (): void => {
    setShowDeleteConfirm(false)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    setShowDeleteConfirm(false)
    if (!userID) return
    try {
      await contactState.deleteFriend(userID)
      onBack?.()
    } catch (e: any | null) {
      console.error(`[C2CChatSetting] deleteFriend failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  
  
  
  const nickname = userInfo?.nickname || ''
  const avatarURL = userInfo?.avatarURL || ''
  const signature = userInfo?.aboutMe || ''
  const isPinned: boolean = currentConversation?.isPinned ?? false

  return (
    <View style={styles.container}>
      {isFirstLoading && userInfo == null ? (
        <ScrollView style={styles.content}>
          <View style={styles.userInfo}>
            <View style={[styles.skeletonAvatar]} />
            <View style={styles.userInfoDetail}>
              <View style={styles.skeletonBlock} />
              <View style={styles.skeletonBlockThin} />
            </View>
          </View>
          <View style={styles.sectionGap} />
          <View style={styles.skeletonRow} />
          <View style={styles.skeletonRow} />
        </ScrollView>
      ) : (
      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.userInfoAvatarWrapper}>
            <Avatar
              src={avatarURL}
              name={friendRemark || nickname || userID || ''}
              size={96}
              shape="square"
              defaultAvatarType="user"
              pureMode
            />
          </View>
          <View style={styles.userInfoDetail}>
            <Text style={styles.userInfoNickname} numberOfLines={1}>
              {nickname || userID}
            </Text>
            <Text style={styles.userInfoId}>ID: {userID || '-'}</Text>
            <Text style={styles.userInfoSignature} numberOfLines={1}>
              {signature ? `${t('contact.signature')}${signature}` : `${t('contact.signature')}${t('common.unset')}`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionGap} />

        {isFriend && (
          <NavigateCell
            label={t('contact.friendRemark')}
            value={friendRemark || ''}
            onClick={handleRemarkClick}
          />
        )}

        <View style={styles.sectionGap} />

        <ToggleCell
          label={t('chatSetting.messageDisturb')}
          modelValue={isNotDisturb}
          onChange={(v) => {
            void handleNotDisturbChange(v)
          }}
        />
        <ToggleCell
          label={t('conversation.pin')}
          modelValue={isPinned}
          onChange={async (v) => {
            try {
              await convListState.pinConversation(conversationID, v)
              await fetchConversationInfo()
            } catch (e: any | null) {
              console.error(`[C2CChatSetting] pinConversation failed: ${e != null ? `${e}` : 'null'}`)
              const msg: string = `${e?.message ?? e ?? ''}`
              if (msg === 'conversation not exists') {
                showToast(t('conversation.notExists'))
              } else {
                showToast(msg)
              }
            }
          }}
        />

        <View style={styles.sectionGap} />

        <ToggleCell
          label={t('contact.blockInList')}
          modelValue={isInBlacklist}
          onChange={(v) => {
            void handleBlacklistChange(v)
          }}
        />

        <View style={styles.sectionGap} />

        <ButtonCell
          label={t('contact.sendMessage')}
          color="#0066FF"
          onClick={handleSendMessage}
        />
        {isFriend && (
          <ButtonCell
            label={t('contact.unfriend')}
            color="#FF3B30"
            onClick={handleDeleteFriendClick}
          />
        )}

        <View style={styles.safeAreaBottom} />
      </ScrollView>
      )}

      {}
      <TextInputPopup
        visible={showRemarkPopup}
        title={t('contact.setRemark')}
        value={friendRemark || ''}
        placeholder={t('contact.remarkPlaceholder')}
        maxLength={15}
        maxByteLength={50}
        onUpdateVisible={setShowRemarkPopup}
        onConfirm={(v) => {
          void handleRemarkConfirm(v)
        }}
        onCancel={(): void => setShowRemarkPopup(false)}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title={t('contact.unfriendConfirm')}
        confirmText={t('common.delete')}
        confirmColor="#FF3B30"
        onUpdateVisible={setShowDeleteConfirm}
        onConfirm={() => {
          void handleDeleteConfirm()
        }}
        onCancel={handleDeleteCancel}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    paddingTop: rpxToPx(24),
    paddingBottom: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  userInfoAvatarWrapper: {
    marginRight: rpxToPx(30),
  },
  userInfoDetail: {
    flex: 1,
    justifyContent: 'center',
  },
  userInfoNickname: {
    fontSize: rpxToPx(36),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: rpxToPx(8),
    maxWidth: rpxToPx(400),
  },
  userInfoId: {
    fontSize: rpxToPx(26),
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: rpxToPx(4),
  },
  userInfoSignature: {
    fontSize: rpxToPx(26),
    color: 'rgba(0, 0, 0, 0.5)',
    maxWidth: rpxToPx(550),
  },
  sectionGap: {
    height: rpxToPx(20),
    backgroundColor: '#F0F2F7',
  },
  safeAreaBottom: {
    height: rpxToPx(68),
  },
  skeletonBlock: {
    height: rpxToPx(36),
    width: rpxToPx(280),
    backgroundColor: '#E5E5E5',
    borderRadius: rpxToPx(8),
    marginBottom: rpxToPx(12),
  },
  skeletonBlockThin: {
    height: rpxToPx(26),
    width: rpxToPx(200),
    backgroundColor: '#E5E5E5',
    borderRadius: rpxToPx(8),
  },
  skeletonAvatar: {
    width: rpxToPx(96),
    height: rpxToPx(96),
    borderRadius: rpxToPx(8),
    backgroundColor: '#E5E5E5',
    marginRight: rpxToPx(30),
  },
  skeletonRow: {
    height: rpxToPx(96),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: rpxToPx(1),
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: rpxToPx(32),
    justifyContent: 'center',
  },
})

export default C2CChatSetting
