import React, { useMemo, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { useGroupMemberState } from 'tuikit-atomicx-react-native'
import { Avatar } from '../Avatar/Avatar'
import { rpxToPx } from '../../utils/rpxToPx'
import { GroupMemberRole, type GroupMember } from './types/group'

export interface GroupMemberListProps {
  conversationID: string
  hideMember?: boolean
  onMemberClick?: (member: GroupMember) => void
}

const getMemberName = (member: GroupMember): string =>
  member.nameCard || member.nickname || member.userID || ''

export const GroupMemberList: React.FC<GroupMemberListProps> = ({
  conversationID,
  hideMember = false,
  onMemberClick,
}) => {
  const { t } = useTranslation()

  const groupID = useMemo<string>(
    () => (conversationID.startsWith('group_') ? conversationID.replace('group_', '') : ''),
    [conversationID]
  )

  const groupMemberState = useGroupMemberState(groupID.length > 0 ? { groupID } : null)
  const [isLoading, setIsLoading] = useState(false)

  const allMembers: GroupMember[] = useMemo((): GroupMember[] => {
    const list: any = (groupMemberState as any).memberList
    if (!Array.isArray(list)) return []
    return list as GroupMember[]
  }, [(groupMemberState as any).memberList])

  const owner: GroupMember | null = useMemo((): GroupMember | null => {
    return allMembers.find((m) => m.role === GroupMemberRole.OWNER) ?? null
  }, [allMembers])

  const admins: GroupMember[] = useMemo(
    () => allMembers.filter((m) => m.role === GroupMemberRole.ADMIN),
    [allMembers]
  )

  const members: GroupMember[] = useMemo(
    () => allMembers.filter((m) => m.role === GroupMemberRole.MEMBER),
    [allMembers]
  )

  const hasMore: boolean = (groupMemberState as any).hasMoreMembers === true

  const handleMemberClick = (member: GroupMember): void => {
    onMemberClick?.(member)
  }

  const handleLoadMore = async (): Promise<void> => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    try {
      await (groupMemberState as any).loadMoreMembers()
    } catch (e: any | null) {
      console.error(`[GroupMemberList] loadMoreMembers failed: ${e != null ? `${e}` : 'null'}`)
    } finally {
      setIsLoading(false)
    }
  }


  type Section = { type: 'header'; title: string } | { type: 'member'; member: GroupMember }
  const sections: Section[] = []
  if (owner != null) {
    sections.push({ type: 'header', title: t('chatSetting.ownerBadge') })
    sections.push({ type: 'member', member: owner })
  }
  if (admins.length > 0) {
    sections.push({ type: 'header', title: `${t('chatSetting.adminBadge')}(${admins.length})` })
    for (const m of admins) sections.push({ type: 'member', member: m })
  }
  if (!hideMember && members.length > 0) {
    sections.push({ type: 'header', title: `${t('chatSetting.groupMembers')}(${members.length})` })
    for (const m of members) sections.push({ type: 'member', member: m })
  }
  if (hasMore && !hideMember) {
    sections.push({ type: 'header', title: isLoading ? t('common.loading') : t('common.loadMore') })
  }

  const renderItem = ({ item }: { item: Section }): React.ReactElement => {
    if (item.type === 'header') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      )
    }
    const member = item.member
    return (
      <TouchableOpacity
        style={styles.memberItem}
        activeOpacity={0.7}
        onPress={() => handleMemberClick(member)}
      >
        <Avatar
          src={member.avatarURL}
          name={getMemberName(member)}
          size={80}
          shape={member.avatarURL ? 'square' : 'circle'}
          defaultAvatarType={member.avatarURL ? 'user' : 'none'}
          pureMode
        />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName} numberOfLines={1}>
            {getMemberName(member)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={sections}
        keyExtractor={(item, idx): string => {
          if (item.type === 'header') return `h-${idx}`
          return `m-${item.member.userID}`
        }}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          <View style={styles.safeAreaBottom} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flex: 1,
  },
  section: {
    marginTop: rpxToPx(20),
    backgroundColor: '#FFFFFF',
    paddingTop: rpxToPx(24),
    paddingBottom: rpxToPx(12),
    paddingHorizontal: rpxToPx(32),
  },
  sectionTitle: {
    fontSize: rpxToPx(24),
    color: '#999999',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: rpxToPx(1),
    borderBottomColor: '#F0F0F0',
  },
  memberInfo: {
    flex: 1,
    marginLeft: rpxToPx(24),
  },
  memberName: {
    fontSize: rpxToPx(30),
    color: '#333333',
    fontWeight: '500',
  },
  safeAreaBottom: {
    height: rpxToPx(68),
    backgroundColor: '#F5F5F5',
  },
})

export default GroupMemberList
