import { useEffect } from 'react'
import {
  useContactState,
  useGroupMemberState,
  useLoginState,
  GroupMemberFilterRole,
} from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseInviteGroupMemberOptions {
  conversationID?: string
  onGroupMemberChanged?: (info: { type: 'add' | 'remove'; groupID: string; count: number }) => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useInviteGroupMember(
  routeParams?: any
): UserPickerHookResult {
  const { t } = useTranslation()
  const options: UseInviteGroupMemberOptions = routeParams ?? {}
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)

  const { friendList, destroyStore: destroyContactListStore, loadFriends } =
    useContactState('inviteGroupMember')
  const groupMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )
  const {
    memberList: allMembers,
    hasMoreMembers,
    addMember,
    loadMoreMembers,
    loadMembers,
  } = groupMemberState as any

  const { loginUserInfo } = useLoginState()
  const myUserID: string = loginUserInfo?.userID ?? ''

  useEffect((): void => {
    if (
      groupID.length > 0 &&
      Array.isArray(allMembers) &&
      allMembers.length === 0 &&
      typeof loadMembers === 'function'
    ) {
      ;loadMembers([GroupMemberFilterRole.ALL]).catch((err: unknown) => {
        console.error('[useInviteGroupMember] loadMembers failed:', err)
      })
    }
    if (typeof loadFriends === 'function') {
      ;(loadFriends as () => Promise<void>)().catch((err: unknown) => {
        console.error('[useInviteGroupMember] loadFriends failed:', err)
      })
    }
  }, [groupID])


  const userList: User[] = (() => {
    const existingMemberIDs = new Set<string>(
      (allMembers || []).map((m: any) => m?.userID).filter((id: any): id is string => Boolean(id))
    )
    return (friendList || [])
      .filter((contact: any) => !existingMemberIDs.has(contact?.userID))
      .filter((contact: any) => contact?.userID !== myUserID)
      .map((contact: any) => ({
        userID: contact?.userID ?? '',
        nickname:
          contact?.friendRemark || contact?.nickname || contact?.userID || '',
        avatarURL: contact?.avatarURL || '',
      }))
  })()

  const lockedItems: string[] = []

  const hasMore: boolean = hasMoreMembers === true


  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    if (selectedUsers.length === 0) {
      
      showToast(t('userPicker.inviteSelect'))
      return
    }

    try {
      const res = await addMember(selectedUsers.map((u) => u.userID))
      if (res.code == 3) {
        showToast(t('userPicker.inviteSuccess'))
      } else {
        showToast(t('userPicker.addSuccess'))
      }
      if (options.onGroupMemberChanged) {
        options.onGroupMemberChanged({ type: 'add', groupID, count: selectedUsers.length })
      }
    } catch (error: any) {
      console.error('[useInviteGroupMember] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.inviteFailed', { msg }))
    }
  }

  const handleCancel = async (): Promise<void> => {
    try {
      await destroyContactListStore()
    } catch (error) {
      console.error('[useInviteGroupMember] handleCancel failed:', error)
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useInviteGroupMember] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 100,
    title: t('userPicker.inviteTitle'),
    hasMore,
    handleConfirm,
    handleCancel,
    onReachEnd,
  }
}
