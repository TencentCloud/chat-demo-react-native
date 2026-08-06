import React, { useEffect, useMemo } from 'react'
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useGroupState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { EmptyList as DefaultEmptyList } from '../placeholders/EmptyList'
import { Loading as DefaultLoading } from '../placeholders/Loading'
import { rpxToPx } from '../../../utils/rpxToPx'
import { getFirstCharKey, strCompare } from '../../../utils/sortByFirstChar'
import type { GroupInfo } from '../types'
import type { GroupListProps, GroupListEmits } from '../types'

export interface GroupListComponentProps extends GroupListProps {
  onGroupSelect?: GroupListEmits['onGroupSelect']
}

interface GroupedSection {
  letter: string
  groups: GroupInfo[]
}

const ENTRY_ITEM_HEIGHT_RPX = 96
const SCREEN_WIDTH = Dimensions.get('window').width

export const GroupList: React.FC<GroupListComponentProps> = ({
  Avatar = DefaultAvatar,
  PlaceholderEmptyList = DefaultEmptyList,
  PlaceholderLoading = DefaultLoading,
  onGroupSelect,
}) => {
  const { t } = useTranslation()
  const { loadJoinedGroups, joinedGroupList } = useGroupState()

  const groupedGroupList = useMemo((): GroupedSection[] => {
    const list: GroupInfo[] = joinedGroupList || []
    const grouped: Record<string, GroupInfo[]> = {}
    for (const item of list) {
      const key = getFirstCharKey(item.groupName || item.groupID || '')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    }
    const letters = Object.keys(grouped).sort((a, b): number => {
      if (a === '#') return 1
      if (b === '#') return -1
      return strCompare(a, b)
    })
    return letters.map((letter) => ({ letter, groups: grouped[letter] }))
  }, [joinedGroupList])

  useEffect(() => {
    loadJoinedGroups().catch((e: any | null): void => {
      console.error(`[GroupList] loadJoinedGroups failed: ${e != null ? `${e}` : 'null'}`)
    })
  }, [])

  void ENTRY_ITEM_HEIGHT_RPX
  void SCREEN_WIDTH

  if ((joinedGroupList || []).length === 0) {
    return (
      <View style={styles.container}>
        <PlaceholderEmptyList text={t('contact.groupsEmpty')} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {groupedGroupList.map((section) => (
        <View key={section.letter}>
          <View style={styles.index}>
            <Text style={styles.indexText}>{section.letter}</Text>
          </View>
          {section.groups.map((group) => (
            <TouchableOpacity
              key={group.groupID}
              style={styles.item}
              activeOpacity={0.7}
              onPress={(): void => onGroupSelect?.(group)}
            >
              <Avatar
                src={group.avatarURL || ''}
                name={group.groupName || group.groupID || ''}
                size={80}
                shape="square"
                defaultAvatarType={(group.groupType || 'group').toLowerCase() as any}
                pureMode
              />
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {group.groupName || group.groupID}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  index: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(12),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#F0F2F7',
  },
  indexText: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '400',
    lineHeight: rpxToPx(40),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: rpxToPx(24),
    paddingVertical: rpxToPx(36),
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: rpxToPx(36),
    fontWeight: '400',
    lineHeight: rpxToPx(48),
    color: '#111111',
  },
})

export default GroupList
