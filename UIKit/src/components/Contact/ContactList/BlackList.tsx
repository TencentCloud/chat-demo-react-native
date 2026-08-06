import React, { useCallback, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { SwipeActions } from '../../SwipeActions/SwipeActions'
import { EmptyList as DefaultEmptyList } from '../placeholders/EmptyList'
import { Loading as DefaultLoading } from '../placeholders/Loading'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { ContactInfo } from '../types'
import type { BlackListProps, BlackListEmits } from '../types'
import { showToast } from '../../../utils/toast'

export interface BlackListComponentProps extends BlackListProps {
  onUserClick?: BlackListEmits['onUserClick']
  onRemove?: BlackListEmits['onRemove']
}

export const BlackList: React.FC<BlackListComponentProps> = ({ Avatar = DefaultAvatar,
  PlaceholderEmptyList = DefaultEmptyList,
  PlaceholderLoading = DefaultLoading,
  onUserClick,
  onRemove }) => {
  const { t } = useTranslation()
  const { blackList, removeFromBlacklist } = useContactState()

  const [isLoading] = useState(false)
  const [closeTriggers, setCloseTriggers] = useState<Record<string, number>>({})
  const [openedSwipeId, setOpenedSwipeId] = useState<string | null>(null)

  const handleSwipeOpen = useCallback(
    (userID: string): void => { if (openedSwipeId != null && openedSwipeId !== userID) {
        setCloseTriggers((prev) => ({
          ...prev,
          [openedSwipeId]: (prev[openedSwipeId] ?? 0) + 1 }))
      }
      setOpenedSwipeId(userID)
    },
    [openedSwipeId]
  )

  const handleUserClick = (user: ContactInfo): void => {
    onUserClick?.(user)
  }

  const handleRemove = async (user: ContactInfo): Promise<void> => {
    if (!user.userID) return
    try {
      await removeFromBlacklist(user.userID)
      showToast(t('contact.removed'))
      onRemove?.(user)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PlaceholderLoading />
      </View>
    )
  }

  if ((blackList || []).length === 0) {
    return (
      <View style={styles.container}>
        <PlaceholderEmptyList text={t('contact.blackListEmpty')} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {(blackList || []).map((user: ContactInfo) => (
        <SwipeActions
          key={user.userID}
          closeTrigger={closeTriggers[user.userID ?? ''] ?? 0}
          actionsWidth={150}
          onContentTap={(): void => handleUserClick(user)}
          onOpen={(): void => {
            if (user.userID) handleSwipeOpen(user.userID)
          }}
          actionsSlot={
            <TouchableOpacity
              style={styles.action}
              activeOpacity={0.7}
              onPress={(): void => {
                handleRemove(user)
              }}
            >
              <Text style={styles.actionText}>{t('contact.removed')}</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.item}>
            <Avatar
              src={user.avatarURL || ''}
              name={user.nickname || user.userID || ''}
              size={80}
              shape="square"
              defaultAvatarType="user"
              pureMode
            />
            <View style={styles.itemContent}>
              <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                {user.nickname || user.userID || ''}
              </Text>
            </View>
          </View>
        </SwipeActions>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#FFFFFF' },
  item: { flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  itemContent: { flex: 1,
    marginLeft: rpxToPx(24),
    paddingVertical: rpxToPx(36),
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9F0',
    justifyContent: 'center' },
  itemName: { fontSize: rpxToPx(36),
    fontWeight: '400',
    lineHeight: rpxToPx(48),
    color: '#111111' },
  action: { flex: 1,
    width: rpxToPx(160),
    backgroundColor: '#E54545',
    justifyContent: 'center',
    alignItems: 'center' },
  actionText: { fontSize: rpxToPx(36),
    fontWeight: '400',
    lineHeight: rpxToPx(48),
    color: '#FFFFFF' },
})

export default BlackList
