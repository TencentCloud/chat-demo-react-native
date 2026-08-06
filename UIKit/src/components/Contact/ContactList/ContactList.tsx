import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Image, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState, useGroupState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { EmptyList as DefaultEmptyList } from '../placeholders/EmptyList'
import { Loading as DefaultLoading } from '../placeholders/Loading'
import { rpxToPx } from '../../../utils/rpxToPx'
import { getFirstCharKey, strCompare } from '../../../utils/sortByFirstChar'
import type { ContactInfo, EntryType, EntryItem } from '../types'
import type { ContactListProps, ContactListEmits } from '../types'
import { iconAssets } from '../../../static/iconBase64'


export interface ContactListComponentProps extends ContactListProps {
  onEntryClick?: ContactListEmits['onEntryClick']
  onContactSelect?: ContactListEmits['onContactSelect']
}

interface GroupedSection {
  letter: string
  friends: ContactInfo[]
}

const ENTRY_ITEM_HEIGHT_RPX = 96
const SCREEN_WIDTH = Dimensions.get('window').width

export const ContactList: React.FC<ContactListComponentProps> = ({
  Avatar = DefaultAvatar,
  PlaceholderEmptyList = DefaultEmptyList,
  PlaceholderLoading = DefaultLoading,
  showNewContact = true,
  showGroupNotification = true,
  showMyGroups = true,
  showBlacklist = true,
  onEntryClick,
  onContactSelect,
}) => {
  const { t } = useTranslation()
  const { friendList, friendApplicationUnreadCount } = useContactState()
  const { unreadApplicationCount, loadApplications } = useGroupState()

  const [isLoading] = useState(false)
  const [activeLetter, setActiveLetter] = useState<string>('')

  const scrollRef = useRef<ScrollView>(null)
  const letterYRef = useRef<Record<string, number>>({})

  const sidebarTopPx = useMemo((): number => {
    const entryCount = (showNewContact ? 1 : 0) +
      (showGroupNotification ? 1 : 0) +
      (showMyGroups ? 1 : 0) +
      (showBlacklist ? 1 : 0)
    const entryHeightPx = (ENTRY_ITEM_HEIGHT_RPX / 750) * SCREEN_WIDTH
    return entryCount * entryHeightPx
  }, [showNewContact, showGroupNotification, showMyGroups, showBlacklist])

  const entryList = useMemo((): EntryItem[] => [
    {
      type: 'newContact',
      label: t('contact.newContactEntry'),
      icon: iconAssets['static/icon/new-contacts.png'],
      visible: showNewContact,
      badge: friendApplicationUnreadCount as number,
    },
    {
      type: 'groupNotification',
      label: t('contact.groupNotificationEntry'),
      icon: iconAssets['static/icon/group-notifications.png'],
      visible: showGroupNotification,
      badge: unreadApplicationCount as number,
    },
    {
      type: 'myGroups',
      label: t('contact.myGroupsEntry'),
      icon: iconAssets['static/icon/groups.png'],
      visible: showMyGroups,
    },
    {
      type: 'blacklist',
      label: t('contact.blacklistEntry'),
      icon: iconAssets['static/icon/blacklist.png'],
      visible: showBlacklist,
    },
  ], [
    showNewContact, showGroupNotification, showMyGroups, showBlacklist,
    friendApplicationUnreadCount, unreadApplicationCount,
  ])

  const visibleEntryList = useMemo(
    (): EntryItem[] => entryList.filter((item) => item.visible),
    [entryList]
  )

  const groupedFriendList = useMemo((): GroupedSection[] => {
    const list: ContactInfo[] = friendList || []
    const grouped: Record<string, ContactInfo[]> = {}
    for (const item of list) {
      const key = getFirstCharKey(item.friendRemark || item.nickname || item.userID || '')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    }
    const letters = Object.keys(grouped).sort((a, b): number => {
      if (a === '#') return 1
      if (b === '#') return -1
      return strCompare(a, b)
    })
    return letters.map((letter) => ({ letter, friends: grouped[letter] }))
  }, [friendList])

  const indexLetters = useMemo(
    (): string[] => groupedFriendList.map((g) => g.letter),
    [groupedFriendList]
  )

  const handleLetterClick = (letter: string): void => {
    setActiveLetter(letter)
    const y = letterYRef.current[letter]
    if (typeof y === 'number' && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 4), animated: false })
    }
  }

  const findActiveLetterByScrollY = useCallback(
    (scrollY: number): string => {
      const yMap = letterYRef.current
      if (indexLetters.length === 0) return ''
      const threshold = 30
      let active = ''
      for (const letter of indexLetters) {
        const y = yMap[letter]
        if (typeof y === 'number' && y <= scrollY + threshold) {
          active = letter
        } else {
          break
        }
      }
      return active
    },
    [indexLetters]
  )

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const scrollY = e.nativeEvent.contentOffset.y
      const next = findActiveLetterByScrollY(scrollY)
      setActiveLetter((prev) => (prev === next ? prev : next))
    },
    [findActiveLetterByScrollY]
  )

  const handleEntryClick = (type: EntryType): void => {
    onEntryClick?.(type)
  }

  const handleContactClick = (contact: ContactInfo): void => {
    onContactSelect?.(contact)
  }

  useEffect(() => {
    if (indexLetters.length > 0 && activeLetter.length === 0) {
      setActiveLetter(indexLetters[0])
    }
  }, [indexLetters, activeLetter])

  const hasLoadedRef = useRef<boolean>(false)

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadApplications().catch((e: any | null): void => {
      console.error(`[ContactList] loadApplications failed: ${e != null ? `${e}` : 'null'}`)
    })
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {visibleEntryList.map((entry, index) => (
          <TouchableOpacity
            key={entry.type}
            style={[
              styles.entry,
              index === visibleEntryList.length - 1 ? styles.entryLast : null,
            ]}
            activeOpacity={0.7}
            onPress={(): void => handleEntryClick(entry.type)}
          >
            <View style={styles.entryIcon}>
              <Avatar
                src={entry.icon}
                name={entry.label}
                size={80}
                shape="square"
                pureMode
              />
            </View>
            <View style={styles.entryContent}>
              <Text style={styles.entryText}>{entry.label}</Text>
              <View style={styles.entryRight}>
                {entry.badge != null && entry.badge > 0 ? (
                  <View style={styles.entryBadge}>
                    <Text style={styles.entryBadgeText}>
                      {entry.badge > 99 ? '99+' : `${entry.badge}`}
                    </Text>
                  </View>
                ) : null}
                <Image
                  source={iconAssets['static/icon/arrow-right.png']}
                  style={styles.entryArrow}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {isLoading ? (
          <View style={styles.placeholder}>
            <PlaceholderLoading />
          </View>
        ) : (friendList || []).length === 0 ? (
          <View style={styles.placeholder}>
            <PlaceholderEmptyList text={t('contact.friendsEmpty')} />
          </View>
        ) : (
          <>
            {groupedFriendList.map((group) => (
              <View
                key={group.letter}
                onLayout={(e): void => {
                  letterYRef.current[group.letter] = e.nativeEvent.layout.y
                }}
              >
                <View style={styles.index}>
                  <Text style={styles.indexText}>{group.letter}</Text>
                  <Text style={styles.indexText}>（{group.friends.length}）</Text>
                </View>
                {group.friends.map((friend) => {
                  return (
                    <TouchableOpacity
                      key={friend.userID || friend.contactID}
                      style={[styles.friend]}
                      activeOpacity={0.7}
                      onPress={(): void => handleContactClick(friend)}
                    >
                      <Avatar
                        src={friend.avatarURL || ''}
                        name={friend.friendRemark || friend.nickname || friend.userID || ''}
                        size={80}
                        shape="square"
                        defaultAvatarType="user"
                        pureMode
                      />
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName} numberOfLines={1}>
                          {friend.friendRemark || friend.nickname || friend.userID}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('contact.friendCountStat', { count: (friendList || []).length })}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {indexLetters.length > 0 ? (
        <View
          style={[styles.sidebarWrapper, { top: sidebarTopPx }]}
          pointerEvents="box-none"
        >
          <View style={styles.sidebar}>
            {indexLetters.map((letter) => (
              <TouchableOpacity
                key={letter}
                onPress={(): void => handleLetterClick(letter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sidebarLetter,
                    activeLetter === letter ? styles.sidebarLetterActive : null,
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  entry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  entryIcon: {
    marginRight: rpxToPx(24),
  },
  entryLast: {
    borderBottomWidth: 0,
  },
  entryContent: {
    flex: 1,
    paddingVertical: rpxToPx(36),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  entryArrow: {
    width: rpxToPx(28),
    height: rpxToPx(28),
  },
  entryText: {
    flex: 1,
    fontSize: rpxToPx(36),
    lineHeight: rpxToPx(48),
    color: '#111111',
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryBadge: {
    minWidth: rpxToPx(36),
    height: rpxToPx(36),
    backgroundColor: '#FF584C',
    borderRadius: rpxToPx(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(10),
    marginRight: rpxToPx(16),
  },
  entryBadgeText: {
    fontSize: rpxToPx(24),
    color: '#FFFFFF',
  },
  placeholder: {
    paddingVertical: rpxToPx(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  index: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(12),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#F2F3F5',
  },
  indexText: {
    fontSize: rpxToPx(28),
    color: '#888888',
    fontWeight: '400',
  },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  friendSelected: {
    backgroundColor: '#F0F2F7',
  },
  friendInfo: {
    flex: 1,
    marginLeft: rpxToPx(24),
    paddingVertical: rpxToPx(36),
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  friendName: {
    flex: 1,
    fontSize: rpxToPx(36),
    lineHeight: rpxToPx(48),
    color: '#111111',
  },
  sidebarWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: rpxToPx(80),
  },
  sidebar: {
    paddingHorizontal: rpxToPx(25),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sidebarLetter: {
    marginBottom: rpxToPx(4),
    fontSize: rpxToPx(24),
    color: '#888888',
    fontWeight: '600',
    lineHeight: rpxToPx(28),
    textAlign: 'center',
  },
  sidebarLetterActive: {
    color: '#1C66E5',
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: rpxToPx(24),
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: '#B2B2B2',
  },
})

export default ContactList
