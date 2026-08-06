
import { USER_PICKER_TYPE, type UserPickerType } from '../const'
import type { UserPickerHook, UserPickerHookResult } from './types'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

import { useStartC2CConversation } from './useStartC2CConversation'
import { useCreateGroup } from './useCreateGroup'
import { useInviteGroupMember } from './useInviteGroupMember'
import { useRemoveGroupMember } from './useRemoveGroupMember'
import { usePromoteAdmin } from './usePromoteAdmin'
import { useDemoteAdmin } from './useDemoteAdmin'
import { useMuteGroupMember } from './useMuteGroupMember'
import { useUnmuteGroupMember } from './useUnmuteGroupMember'
import { useTransferGroupOwner } from './useTransferGroupOwner'
import { useSelectGroupMember } from './useSelectGroupMember'


const hooks: Record<UserPickerType, UserPickerHook> = {
  [USER_PICKER_TYPE.C2C_CONVERSATION]: useStartC2CConversation,
  [USER_PICKER_TYPE.CREATE_GROUP]: useCreateGroup,
  [USER_PICKER_TYPE.INVITE_GROUP_MEMBER]: useInviteGroupMember,
  [USER_PICKER_TYPE.REMOVE_GROUP_MEMBER]: useRemoveGroupMember,
  [USER_PICKER_TYPE.PROMOTE_ADMIN]: usePromoteAdmin,
  [USER_PICKER_TYPE.DEMOTE_ADMIN]: useDemoteAdmin,
  [USER_PICKER_TYPE.MUTE_GROUP_MEMBER]: useMuteGroupMember,
  [USER_PICKER_TYPE.UNMUTE_GROUP_MEMBER]: useUnmuteGroupMember,
  [USER_PICKER_TYPE.TRANSFER_GROUP_OWNER]: useTransferGroupOwner,
  [USER_PICKER_TYPE.SELECT_GROUP_MEMBER]: useSelectGroupMember,
  [USER_PICKER_TYPE.SELECT_GROUP_AT_USER]: useSelectGroupMember,
}


const typeDefaults: Partial<Record<UserPickerType, Record<string, any>>> = {
  [USER_PICKER_TYPE.SELECT_GROUP_AT_USER]: {
    singleSelect: true,
    enableAtAll: true,
    enableRemoteSearch: true,
    excludeSelf: true,
    maxCount: 1,
    titleKey: 'userPicker.atUserTitle',
  },
}

const createDefaultHookResult = (t: (key: string) => string): UserPickerHookResult => ({
  userList: [],
  lockedItems: [],
  maxCount: 500,
  title: t('userPicker.defaultTitle'),
  hasMore: false,
  handleConfirm: async (): Promise<void> => {
    showToast(t('userPicker.unknownType'))
  },
  handleCancel: async (): Promise<void> => {
  },
})

export function useUserPicker(
  type: UserPickerType,
  routeParams?: any
): UserPickerHookResult {
  const { t } = useTranslation()
  const hook = hooks[type]

  if (!hook) {
    console.warn(`[useUserPicker] Unknown type: ${type}`)
    return createDefaultHookResult(t)
  }

  const defaults = typeDefaults[type] || {}
  const mergedParams: Record<string, any> = { ...defaults, ...(routeParams || {}) }
  if (typeof mergedParams.titleKey === 'string' && mergedParams.title == null) {
    mergedParams.title = t(mergedParams.titleKey)
  }
  return hook(mergedParams)
}

export function getTypeName(type: UserPickerType, t: (key: string, options?: any) => string): string {
  const typeNameKeys: Record<UserPickerType, string> = {
    [USER_PICKER_TYPE.C2C_CONVERSATION]: 'userPicker.typeC2C',
    [USER_PICKER_TYPE.CREATE_GROUP]: 'userPicker.typeCreateGroup',
    [USER_PICKER_TYPE.REMOVE_GROUP_MEMBER]: 'userPicker.typeRemoveMember',
    [USER_PICKER_TYPE.INVITE_GROUP_MEMBER]: 'userPicker.typeInviteMember',
    [USER_PICKER_TYPE.PROMOTE_ADMIN]: 'userPicker.typePromoteAdmin',
    [USER_PICKER_TYPE.DEMOTE_ADMIN]: 'userPicker.typeDemoteAdmin',
    [USER_PICKER_TYPE.MUTE_GROUP_MEMBER]: 'userPicker.typeMuteMember',
    [USER_PICKER_TYPE.UNMUTE_GROUP_MEMBER]: 'userPicker.typeUnmuteMember',
    [USER_PICKER_TYPE.TRANSFER_GROUP_OWNER]: 'userPicker.typeTransferOwner',
    [USER_PICKER_TYPE.SELECT_GROUP_MEMBER]: 'userPicker.typeSelectMember',
    [USER_PICKER_TYPE.SELECT_GROUP_AT_USER]: 'userPicker.typeSelectAtMember',
  }

  const key = typeNameKeys[type]
  return key ? t(key) : t('userPicker.typeUnknown', { type })
}


export type { UserPickerHookResult, UserPickerHook } from './types'
