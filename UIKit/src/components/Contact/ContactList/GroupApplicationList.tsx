import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useGroupState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { EmptyList as DefaultEmptyList } from '../placeholders/EmptyList'
import { Loading as DefaultLoading } from '../placeholders/Loading'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { GroupApplicationInfo } from '../types'
import type { GroupApplicationListProps,
  GroupApplicationListEmits } from '../types'
import { showToast } from '../../../utils/toast'

export interface GroupApplicationListComponentProps
  extends GroupApplicationListProps {
  onItemClick?: GroupApplicationListEmits['onItemClick']
  onAccept?: GroupApplicationListEmits['onAccept']
  onReject?: GroupApplicationListEmits['onReject']
}

export const GroupApplicationList: React.FC<GroupApplicationListComponentProps> = ({ Avatar = DefaultAvatar,
  PlaceholderEmptyList = DefaultEmptyList,
  PlaceholderLoading = DefaultLoading,
  onItemClick,
  onAccept,
  onReject }) => {
  const { t } = useTranslation()
  const { unreadApplicationCount,
    clearApplicationUnreadCount,
    applicationList,
    acceptApplication,
    refuseApplication } = useGroupState()

  const [isLoading] = useState(false)

  const pendingApplicationList = useMemo((): GroupApplicationInfo[] => {
    const list: GroupApplicationInfo[] = applicationList || []
    return list.filter((item: GroupApplicationInfo) => item.handledStatus === 0)
  }, [applicationList])

  const handleAccept = async (item: GroupApplicationInfo): Promise<void> => {
    try {
      await acceptApplication(item as any)
      showToast(t('contact.accepted'))
      onAccept?.(item)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  const handleReject = async (item: GroupApplicationInfo): Promise<void> => {
    try {
      await refuseApplication(item as any)
      showToast(t('contact.rejected'))
      onReject?.(item)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  const handleClearUnreadCount = (): void => {
    if (unreadApplicationCount > 0) {
      clearApplicationUnreadCount()
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

  if (pendingApplicationList.length === 0) {
    return (
      <View style={styles.container}>
        <PlaceholderEmptyList text={t('contact.noNewGroupApplication')} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {pendingApplicationList.map((item: GroupApplicationInfo) => (
        <TouchableOpacity
          key={item.applicationID}
          style={styles.applicationItem}
          activeOpacity={0.7}
          onPress={(): void => onItemClick?.(item)}
        >
          <Avatar
            src={item.fromUserAvatarURL || ''}
            name={item.fromUserNickname || item.fromUser || ''}
            size={96}
            shape="square"
            defaultAvatarType="user"
            pureMode
          />
          <View style={styles.itemContent}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.fromUserNickname || item.fromUser}
              </Text>
              <View style={styles.itemDescRow}>
                <Text style={styles.itemDescLabel}>{t('contact.verifyMessageLabel')}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>
                  {item.requestMsg || t('common.none')}
                </Text>
              </View>
              <Text style={styles.itemGroupName} numberOfLines={1}>
                {t('contact.applyToJoinGroup', { name: item.groupName || item.groupID || '' })}
              </Text>
            </View>
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
  itemDescRow: { flexDirection: 'row',
    alignItems: 'center' },
  itemDescLabel: { fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(36),
    color: '#888888' },
  itemDesc: { flex: 1,
    fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(36),
    color: '#888888' },
  itemGroupName: { fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(36),
    color: '#666666' },
  itemActions: { flexDirection: 'row',
    alignItems: 'center' },
  actionBtn: { paddingVertical: rpxToPx(16),
    paddingHorizontal: rpxToPx(24),
    borderRadius: rpxToPx(100),
    marginLeft: rpxToPx(10) },
  actionBtnAccept: { backgroundColor: '#1C66E5' },
  actionBtnReject: { backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9F0' },
  actionBtnText: { fontSize: rpxToPx(26),
    fontWeight: '400',
    lineHeight: rpxToPx(32) },
  actionBtnTextAccept: { color: '#FFFFFF' },
  actionBtnTextReject: { color: 'rgba(0, 0, 0, 0.9)' },
})

export default GroupApplicationList
