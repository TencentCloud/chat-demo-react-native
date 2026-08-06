import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import {
  useContactState,
  useConversationListState,
  ReceiveMessageOpt,
} from 'tuikit-atomicx-react-native'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { ConfirmDialog } from '../../ConfirmDialog/ConfirmDialog'
import { NavigateCell } from '../../Cell/NavigateCell'
import { ToggleCell } from '../../Cell/ToggleCell'
import { rpxToPx } from '../../../utils/rpxToPx'
import { defaultFriendInfoActions } from '../config'
import type { ContactInfo } from '../types'
import type { FriendInfoProps, FriendInfoEmits, FriendInfoAction } from '../types'
import { useTranslation } from 'react-i18next'
import { showToast } from '../../../utils/toast'

export interface FriendInfoComponentProps extends FriendInfoProps {
  onSendMessage?: FriendInfoEmits['onSendMessage']
  onRemarkEdit?: FriendInfoEmits['onRemarkEdit']
  onMuteChange?: FriendInfoEmits['onMuteChange']
  onPinChange?: FriendInfoEmits['onPinChange']
  onBlacklistChange?: FriendInfoEmits['onBlacklistChange']
  onDeleteFriend?: FriendInfoEmits['onDeleteFriend']
}

export const FriendInfo: React.FC<FriendInfoComponentProps> = ({
  friendInfo = null,
  Avatar = DefaultAvatar,
  actions = [],
  onSendMessage,
  onRemarkEdit,
  onMuteChange,
  onPinChange,
  onBlacklistChange,
  onDeleteFriend,
}) => {
  const { t } = useTranslation()
  const contactState: any = useContactState()
  const convListState: any = useConversationListState('FriendInfo')

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fetchedUserInfo, setFetchedUserInfo] = useState<ContactInfo | null>(null)
  const [conversationInfo, setConversationInfo] = useState<any>(null)

  const friendList: any[] = Array.isArray(contactState.friendList)
    ? (contactState.friendList as any[])
    : []
  const friendListUserInfo = useMemo((): ContactInfo | null => {
    if (!friendInfo?.userID) return null
    return (friendList || []).find(
      (item: ContactInfo) => item.userID === friendInfo?.userID
    ) || null
  }, [friendInfo?.userID, friendList])

  const currentFriendInfo = friendListUserInfo || fetchedUserInfo || friendInfo
  const isFriend = !!(currentFriendInfo && (currentFriendInfo as any).isFriend)
  const isBlacklisted = !!(currentFriendInfo && (currentFriendInfo as any).isInBlacklist)

  const actionList = useMemo((): FriendInfoAction[] => {
    const list = actions.length > 0 ? actions : defaultFriendInfoActions
    return list.filter((a) => {
      if (a.key === 'deleteFriend') return isFriend
      return true
    })
  }, [actions, isFriend])

  const conversationID = useMemo((): string => {
    const uid = currentFriendInfo?.userID
    return uid ? `c2c_${uid}` : ''
  }, [currentFriendInfo?.userID])

  const isMuted = useMemo((): boolean => {
    if (!conversationID) return false
    return conversationInfo?.receiveOption === ReceiveMessageOpt.NOT_NOTIFY
  }, [conversationID, conversationInfo?.receiveOption])

  const isPinned = useMemo((): boolean => {
    if (!conversationID) return false
    return !!(conversationInfo && (conversationInfo as any).isPinned)
  }, [conversationID, conversationInfo?.isPinned])

  const fetchPeerUserInfo = async (): Promise<void> => {
    if (!friendInfo?.userID) return
    try {
      const list = await contactState.getContactInfo([friendInfo.userID])
      if (list && list.length > 0) {
        setFetchedUserInfo(list[0] as any)
      }
    } catch (e: any) {
      console.error(`[FriendInfo] fetchPeerUserInfo failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  useEffect(() => {
    if (conversationID) {
      fetchPeerUserInfo()
      convListState.getConversationInfo(conversationID).then((info: any) => {
        if (info != null) setConversationInfo(info)
      }).catch(() => undefined)
    }
  }, [conversationID])

  const handleRemarkEdit = (): void => {
    if (currentFriendInfo) onRemarkEdit?.(currentFriendInfo)
  }

  const handleMuteChange = async (value: boolean): Promise<void> => {
    if (!conversationID) return
    try {
      await convListState.setReceiveMessageOpt(
        conversationID,
        value ? 2 : 0
      )
      setConversationInfo((prev: any): any => prev == null
        ? prev
        : { ...prev, receiveOption: value ? 2 : 0 }
      )
      onMuteChange?.(value)
    } catch (e: any) {
      console.error(`[FriendInfo] handleMuteChange failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handlePinChange = async (value: boolean): Promise<void> => {
    if (!conversationID) return
    try {
      await convListState.pinConversation(conversationID, value)
      setConversationInfo((prev: any): any => prev == null
        ? prev
        : { ...prev, isPinned: value }
      )
      onPinChange?.(value)
    } catch (e: any) {
      console.error(`[FriendInfo] handlePinChange failed: ${e != null ? `${e}` : 'null'}`)
      const msg: string = `${e?.message ?? e ?? ''}`
      if (msg === 'conversation not exists') {
        showToast(t('conversation.notExists'))
      } else {
        showToast(msg)
      }
    }
  }

  const handleBlacklistChange = async (value: boolean): Promise<void> => {
    const uid = currentFriendInfo?.userID
    if (!uid) return
    try {
      if (value) {
        await contactState.addToBlacklist(uid)
      } else {
        await contactState.removeFromBlacklist(uid)
      }
      setFetchedUserInfo((prev: any): any => prev == null
        ? prev
        : { ...prev, isInBlacklist: value }
      )
      try {
        await contactState.loadFriends()
      } catch (e: any | null) {
        console.error(`[FriendInfo] loadFriends after blacklist change failed: ${e != null ? `${e}` : 'null'}`)
      }
      onBlacklistChange?.(value)
    } catch (e: any) {
      console.error(`[FriendInfo] handleBlacklistChange failed: ${e != null ? `${e}` : 'null'}`)
    }
    await fetchPeerUserInfo()
  }

  const handleSendMessage = (): void => {
    if (currentFriendInfo?.userID) onSendMessage?.(currentFriendInfo.userID)
  }

  const handleActionClick = (action: FriendInfoAction): void => {
    const uid = currentFriendInfo?.userID
    if (!uid) return
    if (action.click) {
      action.click(uid)
      return
    }
    switch (action.key) {
      case 'sendMessage':
        handleSendMessage()
        break
      case 'deleteFriend':
        setShowDeleteDialog(true)
        break
      default:
        console.warn(`[FriendInfo] unsupported action key: ${action.key}`)
    }
  }

  const confirmDeleteFriend = async (): Promise<void> => {
    setShowDeleteDialog(false)
    const uid = currentFriendInfo?.userID
    if (!uid) return
    try {
      await contactState.deleteFriend(uid)
      onDeleteFriend?.(uid)
    } catch (e: any) {
      console.error(`[FriendInfo] deleteFriend failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar
            src={currentFriendInfo?.avatarURL || ''}
            name={currentFriendInfo?.nickname || currentFriendInfo?.userID || ''}
            size={96}
            shape="square"
            defaultAvatarType="user"
            pureMode
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {currentFriendInfo?.nickname || currentFriendInfo?.userID}
            </Text>
            <Text style={styles.id} numberOfLines={1}>
              {t('contact.idLabel')}{currentFriendInfo?.userID}
            </Text>
            {(currentFriendInfo as any)?.signature ? (
              <Text style={styles.signature} numberOfLines={2}>
                {t('contact.signature')}{(currentFriendInfo as any).signature}
              </Text>
            ) : null}
          </View>
        </View>

        {isFriend && !isBlacklisted ? (
          <View style={styles.section}>
            <NavigateCell
              label={t('contact.friendRemark')}
              value={(currentFriendInfo as any)?.friendRemark || t('common.unset')}
              onClick={handleRemarkEdit}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <ToggleCell
            label={t('conversation.mute')}
            modelValue={isMuted}
            switchColor="#1C66E5"
            onChange={handleMuteChange}
          />
          <ToggleCell
            label={t('contact.pin')}
            modelValue={isPinned}
            switchColor="#1C66E5"
            onChange={handlePinChange}
          />
        </View>

        <View style={styles.section}>
          <ToggleCell
            label={t('contact.blockInList')}
            modelValue={isBlacklisted}
            switchColor="#1C66E5"
            onChange={handleBlacklistChange}
          />
        </View>

        <View style={styles.section}>
          {actionList.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.row, styles.actionRow]}
              activeOpacity={0.7}
              onPress={(): void => handleActionClick(action)}
            >
              <Text
                style={[styles.link, { color: action.color || '#147AFF' }]}
              >
                {t(action.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t('contact.unfriendConfirmTitle')}
        description={t('contact.deleteFriendWarning')}
        cancelText={t('common.cancel')}
        confirmText={t('contact.unfriendConfirmText')}
        confirmColor="#E54545"
        onCancel={(): void => setShowDeleteDialog(false)}
        onConfirm={(): void => {
          confirmDeleteFriend()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: rpxToPx(32),
  },
  name: {
    fontSize: rpxToPx(36),
    fontWeight: '400',
    color: '#000000',
    lineHeight: rpxToPx(48),
  },
  id: {
    fontSize: rpxToPx(26),
    color: '#888888',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(8),
  },
  signature: {
    fontSize: rpxToPx(26),
    color: '#888888',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(4),
  },
  section: {
    marginTop: rpxToPx(20),
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9F0',
  },
  actionRow: {
    paddingVertical: rpxToPx(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontSize: rpxToPx(34),
    lineHeight: rpxToPx(52),
    fontWeight: '400',
  },
})

export default FriendInfo
