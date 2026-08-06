import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { Avatar } from '../../Avatar/Avatar'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { GroupMember } from '../types/group'

export interface MemberAvatarListProps {
  members?: GroupMember[]
  maxDisplay?: number
  showAddButton?: boolean
  showRemoveButton?: boolean
  showName?: boolean
  onAdd?: () => void
  onRemove?: () => void
  onMemberClick?: (member: GroupMember) => void
}

const ITEMS_PER_ROW = 6

const isLastInRow = (index: number): boolean => (index + 1) % ITEMS_PER_ROW === 0

const getMemberName = (member: GroupMember): string =>
  member.nameCard || member.nickname || member.userID || ''

const MemberAvatarListBase: React.FC<MemberAvatarListProps> = ({
  members = [],
  maxDisplay = 5,
  showAddButton = false,
  showRemoveButton = false,
  showName = false,
  onAdd,
  onRemove,
  onMemberClick,
}) => {
  const displayMembers: GroupMember[] = members.slice(0, maxDisplay)
  const addButtonIndex = displayMembers.length
  const isAddButtonLastInRow = (addButtonIndex + 1) % ITEMS_PER_ROW === 0
  const removeButtonIndex = displayMembers.length + (showAddButton ? 1 : 0)
  const isRemoveButtonLastInRow = (removeButtonIndex + 1) % ITEMS_PER_ROW === 0

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {displayMembers.map((member, index) => (
          <TouchableOpacity
            key={member.userID}
            activeOpacity={0.7}
            style={[
              styles.item,
              isLastInRow(index) ? styles.itemNoMarginRight : null,
            ]}
            onPress={() => onMemberClick?.(member)}
          >
            <Avatar
              src={member.avatarURL}
              name={getMemberName(member)}
              size={80}
              shape="square"
              defaultAvatarType="user"
              pureMode
            />
            {showName && (
              <Text style={styles.name} numberOfLines={1}>
                {getMemberName(member)}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {showAddButton && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.item,
              isAddButtonLastInRow ? styles.itemNoMarginRight : null,
            ]}
            onPress={onAdd}
          >
            <View style={styles.btn}>
              <Text style={styles.btnIcon}>+</Text>
            </View>
            {showName && <Text style={styles.name}>{' '}</Text>}
          </TouchableOpacity>
        )}

        {showRemoveButton && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.item,
              isRemoveButtonLastInRow ? styles.itemNoMarginRight : null,
            ]}
            onPress={onRemove}
          >
            <View style={styles.btn}>
              <Text style={styles.btnIcon}>−</Text>
            </View>
            {showName && <Text style={styles.name}>{' '}</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    paddingTop: rpxToPx(32),
    paddingHorizontal: rpxToPx(32),
  },
  item: {
    alignItems: 'center',
    marginRight: rpxToPx(40),
    marginBottom: rpxToPx(24),
  },
  itemNoMarginRight: {
    marginRight: 0,
  },
  name: {
    fontSize: rpxToPx(24),
    color: 'rgba(0, 0, 0, 0.9)',
    marginTop: rpxToPx(6),
    maxWidth: rpxToPx(80),
    textAlign: 'center',
  },
  btn: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    borderRadius: rpxToPx(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F7',
  },
  btnIcon: {
    fontSize: rpxToPx(48),
    color: '#999999',
  },
})

export const MemberAvatarList = React.memo(MemberAvatarListBase)

export default MemberAvatarList
