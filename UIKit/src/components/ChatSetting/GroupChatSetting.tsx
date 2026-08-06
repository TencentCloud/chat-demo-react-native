import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clipboard, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { useConversationListState,
  useGroupState,
  useGroupMemberState,
  useLoginState,
  loginStore,
  ReceiveMessageOpt } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../utils/rpxToPx'
import { MemberAvatarList } from './components/MemberAvatarList'
import { ButtonCell, NavigateCell, ToggleCell } from '../Cell'
import { TextInputPopup } from '../TextInputPopup/TextInputPopup'
import { ActionSheet, type ActionSheetOption } from './components/ActionSheet'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { GroupType,
  GroupMemberRole,
  GroupJoinOption,
  GroupInviteOption,
  type GroupInfo,
  type GroupMember } from './types/group'
import type { ConversationInfo } from './types/contact'
import { hasPermission,
  showGroupManagement,
  GroupPermission,
  GroupMemberFilterRole } from './utils/groupPermission'
import { UserPickerType } from './types/userpicker'
import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'

export interface GroupChatSettingProps {
  conversationID: string
  onBack?: () => void
  onNavigateToMemberList?: (conversationID: string) => void
  onNavigateToGroupManagement?: (conversationID: string) => void
  onNavigateToUserPicker?: (info: {
    businessType: UserPickerType
    conversationID: string
    onGroupMemberChanged?: (info: { type: 'add' | 'remove'; groupID: string; count: number }) => void
  }) => void
  /**
   * ponytail(v19.120): 替换 useFocusEffect —— 父级页面每次获焦时递增此 key
   * 触发本组件重新拉取群信息 / 成员列表
   * 不传则不触发获焦刷新（与 useFocusEffect 首次 mount 触发一次的行为一致）
   */
  focusKey?: number | string
}

const EDIT_ICON = iconAssets['components/ChatSetting/assets/nvue_edit.png']
const ARROW_RIGHT_ICON = iconAssets['components/ChatSetting/assets/nvue_arrow-right.png']
const COPY_ICON = iconAssets['components/ChatSetting/assets/nvue_file-copy.png']

const mapRawGroupInfo = (raw: any, fallbackGroupID: string): GroupInfo => ({
  groupID: raw.groupID ?? fallbackGroupID,
  groupName: raw.groupName,
  groupType: raw.groupType as GroupType,
  avatarURL: raw.avatarURL,
  notification: raw.notification,
  introduction: raw.introduction,
  memberCount: raw.memberCount,
  joinOption: raw.joinOption as GroupJoinOption,
  inviteOption: raw.inviteOption as GroupInviteOption,
  isAllMuted: raw.isAllMuted,
  selfRole: raw.selfRole as GroupMemberRole,
  ownerID: raw.ownerID,
  createTime: raw.createTime
})

const mapRawConversationInfo = (raw: any): ConversationInfo => ({
  conversationID: raw.conversationID,
  showName: raw.showName,
  conversationType: raw.conversationType,
  receiveOption: raw.receiveOption,
  isPinned: raw.isPinned,
  unreadCount: raw.unreadCount,
  markList: raw.markList
})

export const GroupChatSetting: React.FC<GroupChatSettingProps> = ({ conversationID,
  onBack,
  onNavigateToMemberList,
  onNavigateToGroupManagement,
  onNavigateToUserPicker,
  focusKey }) => {
  const { t } = useTranslation()

  
  const groupID = useMemo<string>(
    () => (conversationID.startsWith('group_') ? conversationID.replace('group_', '') : ''),
    [conversationID]
  )

  
  
  
  const convListState = useConversationListState('groupSetting')
  const groupState = useGroupState()
  const groupMemberState = useGroupMemberState(groupID.length > 0 ? { groupID, role: GroupMemberRole.UNDEFINED } : null)
  const loginState = useLoginState()

  
  
  
  const [isGroupNotExist, setIsGroupNotExist] = useState(false)
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [currentConversation, setCurrentConversation] = useState<ConversationInfo | null>(null)
  const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true)
  const [selfNameCard, setSelfNameCard] = useState('')

  
  const [showGroupNamePopup, setShowGroupNamePopup] = useState(false)
  const [showNicknamePopup, setShowNicknamePopup] = useState(false)
  const [showJoinOptionSheet, setShowJoinOptionSheet] = useState(false)
  const [showInviteOptionSheet, setShowInviteOptionSheet] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showDismissConfirm, setShowDismissConfirm] = useState(false)
  const [showNoticePopup, setShowNoticePopup] = useState(false)
  const [showClearMessageConfirm, setShowClearMessageConfirm] = useState(false)

  
  const clearedByUserPickerRef = useRef(false)
  const skipNextFetchGroupInfoRef = useRef(false)

  
  
  
  const allMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const list: any = (groupMemberState as any).memberList
    if (!Array.isArray(list)) return []
    return list as GroupMember[]
  }, [(groupMemberState as any).memberList])


  const groupName: string = groupInfo?.groupName ?? ''
  const memberCount: number = groupInfo?.memberCount ?? 0
  const notice: string = groupInfo?.notification ?? ''
  const selfRole: number = groupInfo?.selfRole ?? GroupMemberRole.MEMBER
  const groupType: GroupType = (groupInfo?.groupType as GroupType) ?? GroupType.Work
  const joinGroupApprovalType: GroupJoinOption =
    (groupInfo?.joinOption as GroupJoinOption) ?? GroupJoinOption.FORBID
  const inviteToGroupApprovalType: GroupInviteOption =
    (groupInfo?.inviteOption as GroupInviteOption) ?? GroupInviteOption.FORBID

  const isNotDisturb: boolean = useMemo(() => {
    const opt = currentConversation?.receiveOption
    if (opt === undefined) return false
    return opt !== ReceiveMessageOpt.RECEIVE
  }, [currentConversation])
  const isPinned: boolean = currentConversation?.isPinned ?? false

  
  const selfRoleForPermission: GroupMemberFilterRole = useMemo((): GroupMemberFilterRole => {
    if (selfRole === GroupMemberRole.OWNER) return GroupMemberFilterRole.OWNER
    if (selfRole === GroupMemberRole.ADMIN) return GroupMemberFilterRole.ADMIN
    if (selfRole === GroupMemberRole.MEMBER) return GroupMemberFilterRole.MEMBER
    return GroupMemberFilterRole.ALL
  }, [selfRole])

  const canEditGroupName: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.EDIT_GROUP_PROFILE_NAME
  )
  const canEditGroupNotice: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.EDIT_GROUP_PROFILE_NOTIFICATION
  )
  const canEditGroupProfile: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.EDIT_GROUP_PROFILE_ELSE
  )
  const canRemoveMember: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.REMOVE_MEMBER
  )
  const canInviteMember: boolean = inviteToGroupApprovalType !== GroupInviteOption.FORBID
  const showGroupManagementEntry: boolean = showGroupManagement(
    groupType,
    selfRoleForPermission
  )
  const canTransferOwnership: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.TRANSFER_OWNERSHIP
  )
  const canDismissGroup: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.DISMISS_GROUP
  )
  const canQuitGroup: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.QUIT_GROUP
  )

  
  const groupTypeText: string = useMemo(() => { const typeMap: Record<GroupType, string> = {
      [GroupType.Work]: t('chatSetting.groupTypeWork'),
      [GroupType.Public]: t('chatSetting.groupTypePublic'),
      [GroupType.Meeting]: t('chatSetting.groupTypeMeeting'),
      [GroupType.AVChatRoom]: t('chatSetting.groupTypeAVChatRoom'),
      [GroupType.Community]: t('chatSetting.groupTypeCommunity') }
    return typeMap[groupType] || t('common.notAvailable')
  }, [groupType, t])

  const joinOptionText: string = useMemo(() => { const map: Record<GroupJoinOption, string> = {
      [GroupJoinOption.ANY]: t('chatSetting.joinOptionAny'),
      [GroupJoinOption.AUTH]: t('chatSetting.joinOptionAuth'),
      [GroupJoinOption.FORBID]: t('chatSetting.joinOptionForbidden') }
    return map[joinGroupApprovalType] || t('common.notAvailable')
  }, [joinGroupApprovalType, t])

  const inviteOptionText: string = useMemo(() => { const map: Record<GroupInviteOption, string> = {
      [GroupInviteOption.ANY]: t('chatSetting.joinOptionAny'),
      [GroupInviteOption.AUTH]: t('chatSetting.joinOptionAuth'),
      [GroupInviteOption.FORBID]: t('chatSetting.joinOptionForbidden') }
    return map[inviteToGroupApprovalType] || t('common.notAvailable')
  }, [inviteToGroupApprovalType, t])

  
  const joinOptions: ActionSheetOption[] = useMemo(() => [
    { label: t('chatSetting.joinOptionAny'), value: GroupJoinOption.ANY },
    { label: t('chatSetting.joinOptionAuth'), value: GroupJoinOption.AUTH },
    { label: t('chatSetting.joinOptionForbidden'), value: GroupJoinOption.FORBID },
  ], [t])
  const inviteOptions: ActionSheetOption[] = useMemo(() => [
    { label: t('chatSetting.joinOptionAny'), value: GroupInviteOption.ANY },
    { label: t('chatSetting.joinOptionAuth'), value: GroupInviteOption.AUTH },
    { label: t('chatSetting.joinOptionForbidden'), value: GroupInviteOption.FORBID },
  ], [t])

  
  
  

  
  const fetchSelfNameCard = async (): Promise<void> => {
    if (!groupID) return
    try {
      const selfUserID: string = (loginState as any).loginUserInfo?.userID
        ?? loginStore.getState().loginUserInfo?.userID
        ?? ''
      if (selfUserID.length === 0) {
        return
      }
      const memberInfoList: any[] = await groupMemberState.getMemberInfo([selfUserID])
      const [selfMemberInfo] = memberInfoList
      if (selfMemberInfo != null) {
        setSelfNameCard(selfMemberInfo.nameCard ?? '')
      }
    } catch (e: any | null) {
      const errObj: Record<string, any> = e != null ? (e as any) : {}
      const errCode: any = errObj['errCode']
      if (errCode === 10010) {
        setIsGroupNotExist(true)
        return
      }
      console.error(`[GroupChatSetting] Failed to fetch self name card: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const fetchGroupInfo = async (): Promise<void> => { if (!groupID) return
    try {
      const info: any = await groupState.getGroupInfo(groupID)
      if (info) {
        setGroupInfo(mapRawGroupInfo(info, groupID))
        console.log('[GroupChatSetting] fetchGroupInfo success', info.memberCount)
      }
    } catch (e: any | null) {
      const errObj: Record<string, any> = e != null ? (e as any) : {}
      const errCode: any = errObj['errCode']
      if (errCode === 10010) {
        setIsGroupNotExist(true)
        return
      }
      console.error(`[GroupChatSetting] fetchGroupInfo failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const fetchConversationInfo = async (): Promise<void> => { if (!conversationID) return
    try {
      const info: any = await convListState.getConversationInfo(conversationID)
      if (info) {
        setCurrentConversation(mapRawConversationInfo(info))
      }
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] fetchConversationInfo failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  useEffect((): (() => void) | void => {
    if (!groupID) return
    if (groupInfo != null && currentConversation != null) {
      setIsFirstLoading(false)
      return
    }
    void (async (): Promise<void> => {
      try {
        if (groupInfo == null) {
          const raw: any = await groupState.getGroupInfo(groupID)
          if (raw != null) {
            setGroupInfo(mapRawGroupInfo(raw, groupID))
          }
        }
        if (currentConversation == null) {
          const raw: any = await convListState.getConversationInfo(conversationID)
          if (raw != null) {
            setCurrentConversation(mapRawConversationInfo(raw))
          }
        }
      } finally {
        setIsFirstLoading(false)
      }
    })()
    void fetchSelfNameCard()
    return undefined
    
  }, [groupID])

  useEffect((): void => {
    if (!groupID) return
    if (isGroupNotExist) return
    if (skipNextFetchGroupInfoRef.current) {
      skipNextFetchGroupInfoRef.current = false
      return
    }
    fetchGroupInfo().catch((): void => undefined)
    fetchConversationInfo().catch((): void => undefined)
    if (typeof (groupMemberState as any).loadMembers === 'function') {
      (groupMemberState as any).loadMembers([GroupMemberFilterRole.ALL]).catch((e: any | null): void => {
        console.error(`[GroupChatSetting] loadMembers failed: ${e != null ? `${e}` : 'null'}`)
      })
    }
  }, [groupID, isGroupNotExist, focusKey])

  useEffect((): void => {
    const selfUserID: string = (loginState as any).loginUserInfo?.userID
      ?? loginStore.getState().loginUserInfo?.userID
      ?? ''
    if (selfUserID.length === 0) return
    const selfFromList: GroupMember | undefined = allMembers.find(
      (m: GroupMember): boolean => m.userID === selfUserID
    )
    if (selfFromList != null && (selfFromList.nameCard ?? '').length > 0) {
      setSelfNameCard(selfFromList.nameCard ?? '')
    }
    
  }, [allMembers])

  useEffect((): (() => void) | void => {
    const selfUserID: string = (loginState as any).loginUserInfo?.userID
      ?? loginStore.getState().loginUserInfo?.userID
      ?? ''
    if (selfUserID.length === 0) return
    if (groupID.length === 0) return
    void fetchSelfNameCard()
    
  }, [(loginState as any).loginUserInfo?.userID])


  
  
  

  const handleEditGroupName = (): void => {
    if (canEditGroupName) setShowGroupNamePopup(true)
  }

  const handleCopyGroupID = (): void => {
    if (!groupID) return
    try {
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(groupID)
        showToast(t('common.copied'))
      } else {
        showToast(t('common.copied'))
      }
    } catch (e: any | null) {
      showToast(t('common.copyFailed'))
    }
  }

  const handleGroupNameConfirm = async (newName: string): Promise<void> => {
    const newGroupName = newName.trim()
    if (newGroupName === '') {
      showToast(t('chatSetting.groupNameEmpty'))
      return
    }
    if (newGroupName !== groupName) {
      try {
        await groupState.updateProfile({ groupID, groupName: newGroupName })
        await fetchGroupInfo()
      } catch (e: any | null) {
        const errObj: Record<string, any> = e != null ? (e as any) : {}
        const errCode: any = errObj['errCode']
        const errMsgRaw: string = typeof errObj['message'] === 'string' ? String(errObj['message']) : ''
        let errMsg: string = errMsgRaw || t('chatSetting.groupCreateFailed')
        if (errCode === 80001) {
          const m: RegExpMatchArray | null = errMsgRaw.match(/beat word:\s*([^|]+?)\s*(\||$)/i)
          const beatWord: string = m != null ? String(m[1]).trim() : ''
          errMsg = beatWord
            ? t('chatSetting.groupCreateFailedBanned', { beatWord })
            : t('chatSetting.groupCreateFailedBannedShort')
        }
        showToast(errMsg)
      }
    }
  }

  const handleMemberListClick = (): void => {
    onNavigateToMemberList?.(conversationID)
  }

  const handleAddMember = useCallback((): void => {
    clearedByUserPickerRef.current = false
    onNavigateToUserPicker?.({
      businessType: UserPickerType.INVITE_GROUP_MEMBER,
      conversationID,
      onGroupMemberChanged: (info: { type: 'add' | 'remove'; groupID: string; count: number }): void => {
        if (info.type === 'add') {
          setGroupInfo((prev): GroupInfo | null => {
            if (prev == null) return prev
            return { ...prev, memberCount: (prev.memberCount ?? 0) + info.count }
          })
          skipNextFetchGroupInfoRef.current = true
        }
      },
    })
  }, [onNavigateToUserPicker, conversationID, setGroupInfo])

  const handleRemoveMember = useCallback((): void => {
    clearedByUserPickerRef.current = false
    onNavigateToUserPicker?.({
      businessType: UserPickerType.REMOVE_GROUP_MEMBER,
      conversationID,
      onGroupMemberChanged: (info: { type: 'add' | 'remove'; groupID: string; count: number }): void => {
        if (info.type === 'remove') {
          setGroupInfo((prev): GroupInfo | null => {
            if (prev == null) return prev
            return { ...prev, memberCount: Math.max(0, (prev.memberCount ?? 0) - info.count) }
          })
          skipNextFetchGroupInfoRef.current = true
        }
      },
    })
  }, [onNavigateToUserPicker, conversationID, setGroupInfo])

  const handleMemberClick = useCallback((_member: GroupMember): void => {
  }, [])

  const handleNoticeClick = (): void => {
    if (canEditGroupNotice) setShowNoticePopup(true)
  }

  const handleNoticeConfirm = async (newNotice: string): Promise<void> => {
    const newGroupNotice = newNotice.trim()
    if (newGroupNotice !== notice) {
      try {
        await groupState.updateProfile({ groupID, notification: newGroupNotice })
        await fetchGroupInfo()
      } catch (e: any | null) {
        console.error(`[GroupChatSetting] updateProfile notification failed: ${e != null ? `${e}` : 'null'}`)
      }
    }
  }

  const handleGroupManagementClick = (): void => {
    onNavigateToGroupManagement?.(conversationID)
  }

  const handleJoinGroupApprovalTypeClick = (): void => {
    if (canEditGroupProfile) setShowJoinOptionSheet(true)
  }

  const handleJoinOptionSelect = async (option: ActionSheetOption): Promise<void> => {
    try {
      await groupState.setJoinOption(groupID, option.value)
      await fetchGroupInfo()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] setJoinOption failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleInviteGroupApprovalTypeClick = (): void => {
    if (canEditGroupProfile) setShowInviteOptionSheet(true)
  }

  const handleInviteOptionSelect = async (option: ActionSheetOption): Promise<void> => {
    try {
      await groupState.setInviteOption(groupID, option.value)
      await fetchGroupInfo()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] setInviteOption failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleEditNickname = (): void => {
    setShowNicknamePopup(true)
  }

  const handleNicknameConfirm = async (newNickname: string): Promise<void> => {
    const newSelfNameCard = newNickname.trim()
    if (newSelfNameCard === selfNameCard) return
    try {
      await groupMemberState.setSelfNameCard(newSelfNameCard)
      setSelfNameCard(newSelfNameCard)
    } catch (e: any | null) {
      const errObj: Record<string, any> = e != null ? (e as any) : {}
      const errCode: any = errObj['errCode']
      const errMsg: string = errObj['message'] ?? errObj['errMsg'] ?? t('chatSetting.setNicknameFailed')
      console.error(`[GroupChatSetting] setSelfNameCard failed: ${errMsg} (code=${errCode})`)
      showToast(errMsg)
    }
  }

  const handleNotDisturbChange = async (value: boolean): Promise<void> => {
    try {
      const opt: number = value ? ReceiveMessageOpt.NOT_NOTIFY : ReceiveMessageOpt.RECEIVE
      await convListState.setReceiveMessageOpt(`group_${groupID}`, opt)
      await fetchConversationInfo()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] setReceiveMessageOpt failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handlePinnedChange = async (value: boolean): Promise<void> => {
    if (!conversationID) return
    try {
      await convListState.pinConversation(conversationID, value)
      await fetchConversationInfo()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] pinConversation failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleTransferOwnership = (): void => { onNavigateToUserPicker?.({
      businessType: UserPickerType.TRANSFER_GROUP_OWNER,
      conversationID })
  }

  const handleQuitClick = (): void => setShowQuitConfirm(true)
  const handleQuitCancel = (): void => undefined
  const handleQuitConfirm = async (): Promise<void> => {
    setShowQuitConfirm(false)
    try {
      await groupState.quitGroup(groupID)
      onBack?.()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] quitGroup failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleDismissClick = (): void => setShowDismissConfirm(true)
  const handleDismissCancel = (): void => undefined
  const handleDismissConfirm = async (): Promise<void> => {
    setShowDismissConfirm(false)
    try {
      await groupState.dismissGroup(groupID)
      onBack?.()
    } catch (e: any | null) {
      console.error(`[GroupChatSetting] dismissGroup failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleClearMessageClick = (): void => setShowClearMessageConfirm(true)
  const handleClearMessageCancel = (): void => undefined
  const handleClearMessageConfirm = async (): Promise<void> => {
    setShowClearMessageConfirm(false)
    try {
      await convListState.clearConversationMessages(conversationID)
      showToast(t('chatSetting.clearSuccess'))
    } catch (e: any | null) {
      showToast(t('chatSetting.clearFailed'))
    }
  }

  
  
  

  return (
    <View style={styles.container}>
      {isGroupNotExist ? (
        <View style={styles.notExist}>
          <Text style={styles.notExistText}>{t('chatSetting.groupNotExist')}</Text>
        </View>
      ) : isFirstLoading && groupInfo == null ? (
        <ScrollView style={styles.content}>
          <View style={styles.groupNameSection}>
            <View style={styles.skeletonBlock} />
          </View>
          <View style={styles.groupIdSection}>
            <View style={styles.skeletonBlockThin} />
          </View>
          <View style={styles.sectionGap} />
          <View style={styles.memberSection}>
            <View style={styles.memberHeader}>
              <View style={styles.skeletonBlock} />
            </View>
            <View style={styles.skeletonAvatarRow}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonAvatar} />
            </View>
          </View>
          <View style={styles.sectionGap} />
          <View style={styles.noticeSection}>
            <View style={styles.skeletonBlock} />
          </View>
          <View style={styles.sectionGap} />
          <View style={styles.skeletonRow} />
          <View style={styles.skeletonRow} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.groupNameSection}>
            <Text style={styles.label}>{t('chatSetting.groupName')}</Text>
            <TouchableOpacity
              style={styles.groupNameRow}
              activeOpacity={canEditGroupName ? 0.7 : 1}
              onPress={handleEditGroupName}
            >
              <Text style={styles.groupNameValue} numberOfLines={1}>
                {groupName || t('common.unset')}
              </Text>
              {canEditGroupName && (
                <Image style={styles.editIcon} source={EDIT_ICON} resizeMode="contain" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.groupIdSection}>
            <Text style={styles.label}>{t('chatSetting.groupId')}</Text>
            <TouchableOpacity style={styles.groupIdRow} activeOpacity={0.7} onPress={handleCopyGroupID}>
              <Text style={styles.groupIdValue} numberOfLines={1}>
                {groupID}
              </Text>
              <Image style={styles.editIcon} source={COPY_ICON} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionGap} />

          <View style={styles.memberSection}>
            <View style={styles.memberHeader}>
              <Text style={styles.label}>{t('chatSetting.groupMembers')}</Text>
              <TouchableOpacity style={styles.memberHeaderRight} activeOpacity={0.7} onPress={handleMemberListClick}>
                <Text style={styles.memberCount}>{t('chatSetting.memberCount', { count: memberCount })}</Text>
                <Image style={styles.memberArrow} source={ARROW_RIGHT_ICON} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <MemberAvatarList
              members={allMembers}
              maxDisplay={4}
              showAddButton={canInviteMember}
              showRemoveButton={canRemoveMember}
              showName={true}
              onAdd={handleAddMember}
              onRemove={handleRemoveMember}
              onMemberClick={handleMemberClick}
            />
          </View>

          <View style={styles.sectionGap} />

          <View style={styles.noticeSection}>
            <Text style={styles.label}>{t('chatSetting.groupNotice')}</Text>
            <TouchableOpacity
              style={styles.noticeContent}
              activeOpacity={canEditGroupNotice ? 0.7 : 1}
              onPress={handleNoticeClick}
            >
              <Text style={styles.noticeValue} numberOfLines={1}>
                {notice || t('chatSetting.noticeEmpty')}
              </Text>
              {canEditGroupNotice && (
                <Image style={styles.noticeArrow} source={EDIT_ICON} resizeMode="contain" />
              )}
            </TouchableOpacity>
          </View>

          {showGroupManagementEntry && (
            <NavigateCell
              label={t('chatSetting.manageGroup')}
              value=""
              onClick={handleGroupManagementClick}
            />
          )}
          <NavigateCell label={t('chatSetting.groupType')} value={groupTypeText} disabled={true} />
          <NavigateCell
            label={t('chatSetting.joinOptionTitle')}
            value={joinOptionText}
            disabled={!canEditGroupProfile}
            onClick={handleJoinGroupApprovalTypeClick}
          />
          <NavigateCell
            label={t('chatSetting.inviteOptionTitle')}
            value={inviteOptionText}
            disabled={!canEditGroupProfile}
            onClick={handleInviteGroupApprovalTypeClick}
          />

          <View style={styles.sectionGap} />

          <View style={styles.nicknameRow}>
            <Text style={styles.label}>{t('chatSetting.myNicknameInGroup')}</Text>
            <TouchableOpacity style={styles.nicknameRight} activeOpacity={0.7} onPress={handleEditNickname}>
              <Text style={styles.nicknameValue} numberOfLines={1}>
                {selfNameCard || t('common.unset')}
              </Text>
              <Image style={styles.editIcon} source={EDIT_ICON} resizeMode="contain" />
            </TouchableOpacity>
          </View>

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
            onChange={(v) => {
              void handlePinnedChange(v)
            }}
          />

          <View style={styles.sectionGap} />

          {canTransferOwnership && (
            <ButtonCell label={t('chatSetting.transferOwner')} color="#0066FF" onClick={handleTransferOwnership} />
          )}
          {canDismissGroup && (
            <ButtonCell label={t('chatSetting.dissolveGroup')} color="#FF3B30" onClick={handleDismissClick} />
          )}
          {canQuitGroup && (
            <ButtonCell label={t('chatSetting.quitGroup')} color="#FF3B30" onClick={handleQuitClick} />
          )}
          <ButtonCell label={t('chatSetting.clearHistory')} color="#FF3B30" onClick={handleClearMessageClick} />
        </ScrollView>
      )}

      <TextInputPopup
        visible={showGroupNamePopup}
        title={t('chatSetting.editGroupNameTitle')}
        value={groupName}
        placeholder={t('chatSetting.groupName')}
        maxLength={20}
        maxByteLength={100}
        onUpdateVisible={setShowGroupNamePopup}
        onConfirm={(v) => {
          void handleGroupNameConfirm(v)
        }}
        onCancel={(): void => setShowGroupNamePopup(false)}
      />
      <TextInputPopup
        visible={showNoticePopup}
        title={t('chatSetting.editNoticeTitle')}
        value={notice}
        placeholder={t('chatSetting.groupNotice')}
        maxLength={100}
        maxByteLength={400}
        onUpdateVisible={setShowNoticePopup}
        onConfirm={(v) => {
          void handleNoticeConfirm(v)
        }}
        onCancel={(): void => setShowNoticePopup(false)}
      />
      <TextInputPopup
        visible={showNicknamePopup}
        title={t('chatSetting.editNicknameTitle')}
        value={selfNameCard || ''}
        placeholder={t('chatSetting.nickname')}
        maxLength={15}
        maxByteLength={50}
        onUpdateVisible={setShowNicknamePopup}
        onConfirm={(v) => {
          void handleNicknameConfirm(v)
        }}
        onCancel={(): void => setShowNicknamePopup(false)}
      />

      <ActionSheet
        visible={showJoinOptionSheet}
        options={joinOptions}
        onUpdateVisible={setShowJoinOptionSheet}
        onSelect={(o) => {
          void handleJoinOptionSelect(o)
        }}
      />
      <ActionSheet
        visible={showInviteOptionSheet}
        options={inviteOptions}
        onUpdateVisible={setShowInviteOptionSheet}
        onSelect={(o) => {
          void handleInviteOptionSelect(o)
        }}
      />

      <ConfirmDialog
        visible={showQuitConfirm}
        title={t('chatSetting.quitConfirmTitle')}
        description={t('chatSetting.quitConfirmDesc')}
        confirmText={t('chatSetting.quitConfirmText')}
        onUpdateVisible={setShowQuitConfirm}
        onConfirm={() => {
          void handleQuitConfirm()
        }}
        onCancel={handleQuitCancel}
      />
      <ConfirmDialog
        visible={showDismissConfirm}
        title={t('chatSetting.dismissConfirmTitle')}
        description={t('chatSetting.dismissConfirmDesc')}
        confirmText={t('chatSetting.dismissConfirmText')}
        onUpdateVisible={setShowDismissConfirm}
        onConfirm={() => {
          void handleDismissConfirm()
        }}
        onCancel={handleDismissCancel}
      />
      <ConfirmDialog
        visible={showClearMessageConfirm}
        title={t('chatSetting.clearConfirmTitle')}
        description={t('chatSetting.clearConfirmDesc')}
        confirmText={t('chatSetting.clearConfirmText')}
        onUpdateVisible={setShowClearMessageConfirm}
        onConfirm={() => {
          void handleClearMessageConfirm()
        }}
        onCancel={handleClearMessageCancel}
      />
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F0F2F7' },
  notExist: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center' },
  notExistText: { textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.55)',
    fontSize: rpxToPx(32),
    padding: rpxToPx(40) },
  content: { flex: 1 },
  sectionGap: { height: rpxToPx(20),
    backgroundColor: '#F0F2F7' },
  label: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.55)' },
  groupNameSection: { backgroundColor: '#FFFFFF',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between' },
  groupNameRow: { flexDirection: 'row',
    alignItems: 'center' },
  groupNameValue: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    maxWidth: rpxToPx(400) },
  editIcon: { width: rpxToPx(28),
    height: rpxToPx(28),
    marginLeft: rpxToPx(12) },
  groupIdSection: { backgroundColor: '#FFFFFF',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: rpxToPx(1),
    borderTopColor: '#F0F2F7' },
  groupIdRow: { flexDirection: 'row',
    alignItems: 'center' },
  groupIdValue: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    maxWidth: rpxToPx(360) },
  memberSection: { backgroundColor: '#FFFFFF' },
  memberHeader: { flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: rpxToPx(24),
    paddingHorizontal: rpxToPx(32) },
  memberHeaderRight: { flexDirection: 'row',
    alignItems: 'center' },
  memberCount: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)' },
  memberArrow: { width: rpxToPx(28),
    height: rpxToPx(28) },
  noticeSection: { backgroundColor: '#FFFFFF',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    borderBottomWidth: rpxToPx(1),
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between' },
  noticeContent: { flexDirection: 'row',
    alignItems: 'center' },
  noticeValue: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    maxWidth: rpxToPx(450) },
  noticeArrow: { marginLeft: rpxToPx(12),
    width: rpxToPx(28),
    height: rpxToPx(28) },
  nicknameRow: { flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: rpxToPx(1),
    borderBottomColor: '#E5E5E5' },
  nicknameRight: { flexDirection: 'row',
    alignItems: 'center' },
  nicknameValue: { fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    marginRight: rpxToPx(8),
    maxWidth: rpxToPx(400) },
  safeAreaBottom: {},
  skeletonBlock: {
    height: rpxToPx(40),
    width: rpxToPx(400),
    backgroundColor: '#E5E5E5',
    borderRadius: rpxToPx(8),
  },
  skeletonBlockThin: {
    height: rpxToPx(32),
    width: rpxToPx(300),
    backgroundColor: '#E5E5E5',
    borderRadius: rpxToPx(8),
  },
  skeletonAvatarRow: {
    flexDirection: 'row',
    paddingHorizontal: rpxToPx(32),
    paddingVertical: rpxToPx(24),
  },
  skeletonAvatar: {
    width: rpxToPx(96),
    height: rpxToPx(96),
    borderRadius: rpxToPx(48),
    backgroundColor: '#E5E5E5',
    marginRight: rpxToPx(24),
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

export default GroupChatSetting
