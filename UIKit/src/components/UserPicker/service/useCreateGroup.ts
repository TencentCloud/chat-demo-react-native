import { useEffect } from 'react'
import { useContactState } from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseCreateGroupOptions {
  onNavigateToCreateGroup?: (selectedUsers: User[]) => void
}

export function useCreateGroup(routeParams?: any): UserPickerHookResult {
  const { t } = useTranslation()
  const options: UseCreateGroupOptions = routeParams ?? {}
  const { friendList, destroyStore, loadFriends } = useContactState('createGroup')


  const userList: User[] = (friendList || []).map((contact: any) => ({
    userID: contact?.userID ?? '',
    nickname:
      contact?.friendRemark || contact?.nickname || contact?.userID || '',
    avatarURL: contact?.avatarURL || '',
  }))

  useEffect((): void => {
    if (typeof loadFriends === 'function') {
      ;(loadFriends as () => Promise<void>)().catch((err: unknown) => {
        console.error('[useCreateGroup] loadFriends failed:', err)
      })
    }
  }, [])

  const lockedItems: string[] = []

  const hasMore: boolean = false


  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    if (selectedUsers.length === 0) {
      showToast(t('userPicker.createGroupSelectMember'))
      return
    }

    if (options.onNavigateToCreateGroup) {
      options.onNavigateToCreateGroup(selectedUsers)
    }
  }

  const handleCancel = async (): Promise<void> => {
    void destroyStore
  }

  return {
    userList,
    lockedItems,
    maxCount: 500, 
    title: t('userPicker.createGroupTitle'), 
    hasMore,
    handleConfirm,
    handleCancel,
  }
}
