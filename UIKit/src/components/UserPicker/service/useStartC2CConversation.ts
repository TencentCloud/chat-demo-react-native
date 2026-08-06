import { useEffect } from 'react'
import { useContactState } from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseStartC2CConversationOptions {
  onNavigateToC2C?: (conversationID: string) => void
}

export function useStartC2CConversation(
  routeParams?: any
): UserPickerHookResult {
  const { t } = useTranslation()
  const options: UseStartC2CConversationOptions = routeParams ?? {}
  const { friendList, destroyStore, loadFriends } = useContactState('startC2CConversation')


  const userList: User[] = (friendList || []).map((contact: any) => ({
    userID: contact?.userID ?? '',
    nickname:
      contact?.friendRemark || contact?.nickname || contact?.userID || '',
    avatarURL: contact?.avatarURL || '',
  }))

  useEffect((): void => {
    if (typeof loadFriends === 'function') {
      ;(loadFriends as () => Promise<void>)().catch((err: unknown) => {
        console.error('[useStartC2CConversation] loadFriends failed:', err)
      })
    }
  }, [])

  const lockedItems: string[] = []

  const hasMore: boolean = false


  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    if (selectedUsers.length === 0) {
      showToast(t('userPicker.c2cSelectContact'))
      return
    }

    const selectedUser = selectedUsers[0]
    const conversationID = `c2c_${selectedUser.userID}`

    void destroyStore 
    if (options.onNavigateToC2C) {
      options.onNavigateToC2C(conversationID)
    }
  }

  const handleCancel = async (): Promise<void> => {
    void destroyStore
  }

  return {
    userList,
    lockedItems,
    maxCount: 1,
    title: t('userPicker.c2cTitle'),
    hasMore,
    handleConfirm,
    handleCancel,
  }
}
