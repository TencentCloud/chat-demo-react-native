import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { EmptyList as DefaultEmptyList } from '../placeholders/EmptyList'
import { Loading as DefaultLoading } from '../placeholders/Loading'
import { rpxToPx } from '../../../utils/rpxToPx'
import { showToast } from '../../../utils/toast'
import type { FriendApplicationInfo } from '../types'
import type { FriendApplicationListProps,
  FriendApplicationListEmits } from '../types'

export interface FriendApplicationListComponentProps
  extends FriendApplicationListProps {
  onItemClick?: FriendApplicationListEmits['onItemClick']
  onAccept?: FriendApplicationListEmits['onAccept']
  onReject?: FriendApplicationListEmits['onReject']
}

export const FriendApplicationList: React.FC<FriendApplicationListComponentProps> = ({ Avatar = DefaultAvatar,
  PlaceholderEmptyList = DefaultEmptyList,
  PlaceholderLoading = DefaultLoading,
  onItemClick,
  onAccept,
  onReject }) => {
  const { t } = useTranslation()
  const { friendApplicationUnreadCount,
    friendApplicationList,
    acceptFriendApplication,
    refuseFriendApplication,
    clearFriendApplicationUnreadCount } = useContactState()

  const [isLoading] = useState(false)

  const getStatusText = (item: FriendApplicationInfo): string => {
    if (item.type === 2) return t('contact.friendApplicationWaiting')
    return ''
  }

  const handleAccept = async (item: FriendApplicationInfo): Promise<void> => {
    try {
      await acceptFriendApplication(item as any)
      showToast(t('contact.accepted'))
      onAccept?.(item)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  const handleReject = async (item: FriendApplicationInfo): Promise<void> => {
    try {
      await refuseFriendApplication(item as any)
      showToast(t('contact.rejected'))
      onReject?.(item)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  const handleClearUnreadCount = (): void => {
    if (friendApplicationUnreadCount > 0) {
      clearFriendApplicationUnreadCount()
    }
  }

  useEffect(() => {
    handleClearUnreadCount()
    return (): void => handleClearUnreadCount()
  }, [])

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <PlaceholderLoading />
      </View>
    )
  }

  if ((friendApplicationList || []).length === 0) {
    return (
      <View style={styles.container}>
        <PlaceholderEmptyList text={t('contact.noNewFriendApplication')} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {(friendApplicationList || []).map((item: FriendApplicationInfo) => (
        <TouchableOpacity
          key={item.applicationID}
          style={styles.applicationItem}
          activeOpacity={0.7}
          onPress={(): void => onItemClick?.(item)}
        >
          <Avatar
            src={item.avatarURL || ''}
            name={item.title || item.applicationID || ''}
            size={80}
            shape="square"
            defaultAvatarType="user"
            pureMode
          />
          <View style={styles.itemContent}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.title || item.applicationID}
              </Text>
              {item.addWording ? (
                <Text style={styles.itemWording} numberOfLines={1}>
                  {item.addWording}
                </Text>
              ) : null}
            </View>
            {item.type === 1 ? (
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnAccept]}
                  activeOpacity={0.7}
                  onPress={(): void => {
                    handleAccept(item)
                  }}
                >
                  <Text style={[styles.actionBtnText, styles.actionBtnTextAccept]}>
                    {t('contact.accept')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnReject]}
                  activeOpacity={0.7}
                  onPress={(): void => {
                    handleReject(item)
                  }}
                >
                  <Text style={[styles.actionBtnText, styles.actionBtnTextReject]}>
                    {t('contact.reject')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemStatus}>
                <Text style={styles.itemStatusText}>{getStatusText(item)}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F2F3F5' },
  placeholder: { flex: 1 },
  applicationItem: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    marginBottom: rpxToPx(2) },
  itemContent: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: rpxToPx(24) },
  itemInfo: { flex: 1,
    flexDirection: 'column' },
  itemName: { fontSize: rpxToPx(36),
    fontWeight: '400',
    lineHeight: rpxToPx(48),
    color: '#111111' },
  itemWording: { fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(36),
    color: '#888888',
    marginTop: rpxToPx(4) },
  itemActions: { flexDirection: 'row',
    alignItems: 'center' },
  actionBtn: { paddingVertical: rpxToPx(12),
    paddingHorizontal: rpxToPx(24),
    borderRadius: rpxToPx(32),
    marginLeft: rpxToPx(16) },
  actionBtnAccept: { backgroundColor: '#1C66E5' },
  actionBtnReject: { backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD' },
  actionBtnText: { fontSize: rpxToPx(26),
    fontWeight: '400',
    lineHeight: rpxToPx(32) },
  actionBtnTextAccept: { color: '#FFFFFF' },
  actionBtnTextReject: { color: '#000000' },
  itemStatus: { flexDirection: 'row',
    alignItems: 'center' },
  itemStatusText: { fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    color: '#888888' },
})

export default FriendApplicationList
