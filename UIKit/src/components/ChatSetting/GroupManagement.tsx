import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import {
  useGroupState,
  useGroupMemberState,
} from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../utils/rpxToPx'
import { MemberAvatarList } from './components/MemberAvatarList'
import { ToggleCell } from '../Cell'
import {
  GroupType,
  GroupMemberRole,
  GroupMemberFilterRole,
  type GroupInfo,
  type GroupMember,
} from './types/group'
import { hasPermission, GroupPermission } from './utils/groupPermission'
import { UserPickerType } from './types/userpicker'
import { iconAssets } from '../../static/iconBase64'

export interface GroupManagementProps {
  conversationID: string
  onNavigateToMemberList?: (conversationID: string, hideMember: boolean) => void
  onNavigateToUserPicker?: (info: {
    businessType: UserPickerType
    conversationID: string
  }) => void
  /**
   * ponytail(v19.120): 替换 useFocusEffect —— 父级页面每次获焦时递增此 key
   * 触发本组件重新拉取群信息 / Admin / Owner / All 成员
   * 不传则不触发获焦刷新
   */
  focusKey?: number | string
}

const ARROW_RIGHT_ICON = iconAssets['components/ChatSetting/assets/nvue_arrow-right.png']

export const GroupManagement: React.FC<GroupManagementProps> = ({
  conversationID,
  onNavigateToMemberList,
  onNavigateToUserPicker,
  focusKey,
}) => {
  const { t } = useTranslation()

  const groupID = useMemo<string>(
    () => (conversationID.startsWith('group_') ? conversationID.replace('group_', '') : ''),
    [conversationID]
  )

  const adminMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID, role: GroupMemberFilterRole.ADMIN } : null
  )
  const ownerMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID, role: GroupMemberFilterRole.OWNER } : null
  )
  const allMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )

  const groupState = useGroupState()

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)

  const groupType: GroupType = (groupInfo?.groupType as GroupType) ?? GroupType.Work
  const isAllMuted: boolean = groupInfo?.isAllMuted ?? false
  const selfRole: number = groupInfo?.selfRole ?? GroupMemberRole.MEMBER
  const memberCount: number = groupInfo?.memberCount ?? 0

  const selfRoleForPermission: GroupMemberFilterRole = useMemo((): GroupMemberFilterRole => {
    if (selfRole === GroupMemberRole.OWNER) return GroupMemberFilterRole.OWNER
    if (selfRole === GroupMemberRole.ADMIN) return GroupMemberFilterRole.ADMIN
    if (selfRole === GroupMemberRole.MEMBER) return GroupMemberFilterRole.MEMBER
    return GroupMemberFilterRole.ALL
  }, [selfRole])

  const canPromoteAdmin: boolean = selfRole === GroupMemberRole.OWNER
  const canDemoteAdmin: boolean = selfRole === GroupMemberRole.OWNER
  const canMuteMember: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.MUTE_MEMBER
  )
  const canMuteAllMembers: boolean = hasPermission(
    groupType,
    selfRoleForPermission,
    GroupPermission.MUTE_ALL_MEMBERS
  )

  const adminMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const list: any = (adminMemberState as any).memberList
    console.log('adminMembers', list)
    if (!Array.isArray(list)) return []
    return list as GroupMember[]
  }, [(adminMemberState as any).memberList])

  const ownerMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const list: any = (ownerMemberState as any).memberList
    console.log('ownerMembers', list)
    if (!Array.isArray(list)) return []
    return list as GroupMember[]
  }, [(ownerMemberState as any).memberList])

  const allMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const list: any = (allMemberState as any).memberList
    console.log('allMembers', list)
    if (!Array.isArray(list)) return []
    return list as GroupMember[]
  }, [(allMemberState as any).memberList])

  const adminAndOwnerMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const merged: GroupMember[] = [...adminMembers, ...ownerMembers].filter(
      (m): m is GroupMember => m != null
    )
    const seen = new Set<string>()
    return merged.filter((m: GroupMember) => {
      if (seen.has(m.userID)) return false
      if (m.role === GroupMemberRole.OWNER || m.role === GroupMemberRole.ADMIN) {
        seen.add(m.userID)
        return true
      }
      return false
    })
  }, [adminMembers, ownerMembers])

  const mutedMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const nowSec = Date.now() / 1000
    return allMembers.filter((m) => (m.muteUntil ?? 0) > nowSec)
  }, [allMembers])

  const loadGroupInfo = async (): Promise<void> => {
    if (!groupID) return
    try {
      const info: any = await groupState.getGroupInfo(groupID)
      if (info) {
        setGroupInfo({
          groupID: info.groupID ?? groupID,
          groupName: info.groupName,
          groupType: info.groupType as GroupType,
          avatarURL: info.avatarURL,
          notification: info.notification,
          introduction: info.introduction,
          memberCount: info.memberCount,
          joinOption: info.joinOption,
          inviteOption: info.inviteOption,
          isAllMuted: info.isAllMuted,
          selfRole: info.selfRole as GroupMemberRole,
          ownerID: info.ownerID,
          createTime: info.createTime,
        })
      }
    } catch (e: any | null) {
      console.error(`[GroupManagement] Failed to fetch group info: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const fetchAllAdmin = async (): Promise<void> => {
    await (adminMemberState as any).loadMembers([GroupMemberFilterRole.ADMIN])
  }

  useEffect((): void => {
    if (!groupID) return
    void loadGroupInfo()
    void fetchAllAdmin()
    void (ownerMemberState as any).loadMembers?.([GroupMemberFilterRole.OWNER])
    void (allMemberState as any).loadMembers?.([GroupMemberFilterRole.ALL])
  }, [groupID, adminMemberState, ownerMemberState, allMemberState, focusKey])


  const handleMemberListClick = (): void => {
    onNavigateToMemberList?.(conversationID, true)
  }

  const handlePromoteAdmin = (): void => {
    onNavigateToUserPicker?.({
      businessType: UserPickerType.PROMOTE_ADMIN,
      conversationID,
    })
  }

  const handleDemoteAdmin = (): void => {
    onNavigateToUserPicker?.({
      businessType: UserPickerType.DEMOTE_ADMIN,
      conversationID,
    })
  }

  const handleMemberClick = (_member: GroupMember): void => {
  }

  const handleMuteAllChange = async (value: boolean): Promise<void> => {
    try {
      await groupState.muteAllMembers(groupID, value)
      await loadGroupInfo()
    } catch (e: any | null) {
      console.error(`[GroupManagement] muteAllMembers failed: ${e != null ? `${e}` : 'null'}`)
    }
  }

  const handleAddMuteMember = (): void => {
    onNavigateToUserPicker?.({
      businessType: UserPickerType.MUTE_GROUP_MEMBER,
      conversationID,
    })
  }

  const handleRemoveMuteMember = (): void => {
    onNavigateToUserPicker?.({
      businessType: UserPickerType.UNMUTE_GROUP_MEMBER,
      conversationID,
    })
  }

  const handleMutedMemberClick = (_member: GroupMember): void => {
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.memberSection}>
          <TouchableOpacity style={styles.memberHeader} activeOpacity={0.7} onPress={handleMemberListClick}>
            <Text style={styles.memberLabel}>{t('chatSetting.admins')}</Text>
            <View style={styles.memberHeaderRight}>
              <Text style={styles.memberCount}>{t('chatSetting.memberCount', { count: adminAndOwnerMembers.length })}</Text>
              <Image style={styles.memberArrow} source={ARROW_RIGHT_ICON} resizeMode="contain" />
            </View>
          </TouchableOpacity>
          <MemberAvatarList
            members={adminAndOwnerMembers}
            maxDisplay={5}
            showAddButton={canPromoteAdmin}
            showRemoveButton={canDemoteAdmin}
            showName={true}
            onAdd={handlePromoteAdmin}
            onRemove={handleDemoteAdmin}
            onMemberClick={handleMemberClick}
          />
        </View>

        <View style={styles.sectionGap} />

        <ToggleCell
          label={t('chatSetting.muteAll')}
          modelValue={isAllMuted}
          disabled={!canMuteAllMembers}
          onChange={(v) => {
            void handleMuteAllChange(v)
          }}
        />
        <Text style={styles.muteAllDesc}>{t('chatSetting.muteAllDesc')}</Text>

        {canMuteMember && !isAllMuted && (
          <View style={styles.muteMemberSection}>
            <View style={styles.muteMemberHeader}>
              <Text style={styles.memberLabel}>{t('chatSetting.singleMute')}</Text>
            </View>
            <MemberAvatarList
              members={mutedMembers}
              maxDisplay={500}
              showAddButton={true}
              showRemoveButton={mutedMembers.length > 0}
              showName={true}
              onAdd={handleAddMuteMember}
              onRemove={handleRemoveMuteMember}
              onMemberClick={handleMutedMemberClick}
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F7',
  },
  content: {
    flex: 1,
  },
  sectionGap: {
    height: rpxToPx(20),
    backgroundColor: '#F0F2F7',
  },
  memberSection: {
    backgroundColor: '#FFFFFF',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
  },
  memberLabel: {
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.5)',
  },
  memberHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
  },
  memberArrow: {
    width: rpxToPx(28),
    height: rpxToPx(28),
  },
  muteAllDesc: {
    paddingTop: rpxToPx(8),
    paddingBottom: rpxToPx(32),
    paddingHorizontal: rpxToPx(32),
    fontSize: rpxToPx(28),
    backgroundColor: '#F0F2F7',
    color: 'rgba(0, 0, 0, 0.4)',
  },
  muteMemberSection: {
    backgroundColor: '#FFFFFF',
    marginTop: rpxToPx(20),
  },
  muteMemberHeader: {
    paddingTop: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
  },
})

export default GroupManagement
