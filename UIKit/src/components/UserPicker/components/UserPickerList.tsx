import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { rpxToPx } from '../../../utils/rpxToPx'
import { sortByFirstChar } from '../../../utils/sortByFirstChar'
import { Avatar } from '../../Avatar/Avatar'
import { showToast } from '../../../utils/toast'
import type { User } from '../types/user'

const DEFAULT_AVATAR =
  'https://web.sdk.qcloud.com/im/assets/all-in-one/user.png'

import { useTranslation } from 'react-i18next'
import { iconAssets } from '../../../static/iconBase64'

export interface UserPickerListProps {
  maxCount?: number
  dataSource?: User[]
  lockedItems?: string[]
  title?: string
  singleSelect?: boolean
  pinnedTopItems?: User[]
  remoteSearch?: boolean
  enableSearch?: boolean
}

export interface UserPickerListEmits {
  onBack?: () => void
  onConfirm?: (users: User[]) => void
  onSearchChange?: (keyword: string) => void
}

const ALPHABET_LIST = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#',
]

export const UserPickerList: React.FC<UserPickerListProps & UserPickerListEmits> = ({
  maxCount = 500,
  dataSource = [],
  lockedItems = [],
  title: _title,
  singleSelect = false,
  pinnedTopItems = [],
  remoteSearch = false,
  enableSearch = true,
  onBack: _onBack,
  onConfirm,
  onSearchChange,
}) => {
  const { t } = useTranslation()
  const resolvedTitle = _title ?? t('userPicker.defaultTitle')
  void resolvedTitle
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([])
  const [currentLetter, setCurrentLetter] = useState<string>('A')

  const showMaxCountDialog = (): void => {
    showToast(t('userPicker.maxCountToast', { count: maxCount }))
  }

  const scrollRef = useRef<ScrollView>(null)
  const letterYRef = useRef<Record<string, number>>({})
  const groupedUsersRef = useRef<{ letter: string; users: User[] }[]>([])
  const currentLetterRef = useRef<string>('A')
  const isTapScrollingRef = useRef<boolean>(false)
  useEffect(() => {
    currentLetterRef.current = currentLetter
  }, [currentLetter])

  const computeActiveLetter = useCallback((scrollY: number): string => {
    let active = currentLetterRef.current
    for (const group of groupedUsersRef.current) {
      const y = letterYRef.current[group.letter]
      if (typeof y === 'number' && y <= scrollY) {
        active = group.letter
      } else {
        break
      }
    }
    return active
  }, [])

  const handleScroll = useCallback((e: any): void => {
    if (isTapScrollingRef.current) return
    const scrollY = e.nativeEvent.contentOffset.y
    const active = computeActiveLetter(scrollY)
    if (active !== currentLetterRef.current) {
      setCurrentLetter(active)
    }
  }, [computeActiveLetter])

  const handleMomentumScrollEnd = useCallback((e: any): void => {
    if (!isTapScrollingRef.current) return
    isTapScrollingRef.current = false
    const scrollY = e.nativeEvent.contentOffset.y
    const active = computeActiveLetter(scrollY)
    if (active !== currentLetterRef.current) {
      setCurrentLetter(active)
    }
  }, [computeActiveLetter])

  useEffect((): void => {
    if (onSearchChange) {
      onSearchChange(searchKeyword)
    }
  }, [searchKeyword, onSearchChange])

  const groupedUsers = useMemo((): { letter: string; users: User[] }[] => {
    const { groupedList } = sortByFirstChar<User>(
      dataSource || [],
      (user: User) => user.nickname || user.userID || '',
      true
    )

    const groups: { letter: string; users: User[] }[] = []
    const letters = Object.keys(groupedList).sort((a, b) => {
      if (a === '#' && b !== '#') return 1
      if (b === '#' && a !== '#') return -1
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })

    letters.forEach((letter) => {
      groups.push({ letter, users: groupedList[letter] })
    })

    return groups
  }, [dataSource])

  useEffect(() => {
    groupedUsersRef.current = groupedUsers
  }, [groupedUsers])

  const alphabetList: string[] = useMemo(() => {
    return ALPHABET_LIST.filter((letter) =>
      groupedUsers.some((group) => group.letter === letter)
    )
  }, [groupedUsers])

  const filteredGroups = useMemo((): { letter: string; users: User[] }[] => {
    if (remoteSearch || searchKeyword.trim().length === 0) {
      return groupedUsers
    }

    const keyword = searchKeyword.toLowerCase()
    return groupedUsers
      .map((group) => ({
        ...group,
        users: group.users.filter((user) => {
          const name = (user.nickname || user.userID || '').toLowerCase()
          return name.includes(keyword)
        }),
      }))
      .filter((group) => group.users.length > 0)
  }, [groupedUsers, searchKeyword, remoteSearch])

  const selectedUsers = useMemo((): User[] => {
    return selectedUserIDs
      .map((userID) =>
        (dataSource || []).find((user) => user.userID === userID)
      )
      .filter((u): u is User => Boolean(u))
  }, [selectedUserIDs, dataSource])

  const isSearching = useMemo<boolean>(
    () => searchKeyword.trim().length > 0,
    [searchKeyword]
  )

  const showEmpty = useMemo<boolean>(() => {
    if (filteredGroups.length > 0) return false
    if (isSearching) return true
    return (pinnedTopItems || []).length === 0
  }, [filteredGroups.length, isSearching, pinnedTopItems])

  const emptyText = useMemo<string>(
    () => (isSearching ? t('userPicker.noMatch') : t('userPicker.noMembers')),
    [isSearching, t]
  )

  const isUserSelected = (userID: string): boolean =>
    selectedUserIDs.includes(userID)
  const isUserDisabled = (userID: string): boolean =>
    lockedItems.includes(userID)

  const handleUserSelect = (user: User): void => {
    if (isUserDisabled(user.userID)) return

    if (singleSelect) {
      onConfirm?.([user])
      return
    }

    const index = selectedUserIDs.indexOf(user.userID)
    if (index > -1) {
      const next = [...selectedUserIDs]
      next.splice(index, 1)
      setSelectedUserIDs(next)
    } else {
      if (selectedUserIDs.length >= maxCount) {
        showMaxCountDialog()
        return
      }
      setSelectedUserIDs([...selectedUserIDs, user.userID])
    }
  }

  const handlePinnedSelect = (user: User): void => {
    if (singleSelect) {
      onConfirm?.([user])
      return
    }
    const index = selectedUserIDs.indexOf(user.userID)
    if (index > -1) {
      const next = [...selectedUserIDs]
      next.splice(index, 1)
      setSelectedUserIDs(next)
    } else {
      if (selectedUserIDs.length >= maxCount) {
        showMaxCountDialog()
        return
      }
      setSelectedUserIDs([...selectedUserIDs, user.userID])
    }
  }

  const handleSearch = (text: string): void => {
    setSearchKeyword(text)
  }

  const handleAlphabetTap = (letter: string): void => {
    setCurrentLetter(letter)
    const y = letterYRef.current[letter]
    if (typeof y === 'number' && scrollRef.current) {
      isTapScrollingRef.current = true
      scrollRef.current.scrollTo({ y, animated: true })
    }
  }

  const handleConfirm = (): void => {
    if (selectedUsers.length === 0) return
    onConfirm?.(selectedUsers)
  }

  return (
    <View style={styles.userPicker}>
      {enableSearch && (
        <View style={styles.searchBar}>
          <View style={styles.searchContainer}>
            <Image
              source={iconAssets['static/icon/search.png']}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor="#BBBBBB"
              value={searchKeyword}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>
      )}

      <View style={styles.content}>
        <ScrollView
          ref={scrollRef}
          style={styles.userList}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
        >
          {!isSearching &&
            pinnedTopItems &&
            pinnedTopItems.length > 0 &&
            pinnedTopItems.map((pinned) => (
              <View key={pinned.userID} style={styles.pinnedGroup}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.userItemPinned}
                  onPress={(): void => handlePinnedSelect(pinned)}
                >
                  {!singleSelect && (
                    <View style={styles.checkboxWrapper}>
                      <View
                        style={[
                          styles.checkbox,
                          isUserSelected(pinned.userID) && styles.checkboxChecked,
                        ]}
                      >
                        {isUserSelected(pinned.userID) && (
                          <Image
                            source={iconAssets['static/icon/checked.png']}
                            style={styles.checkboxIcon}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </View>
                  )}
                  <View style={styles.avatarAll}>
                    <Text style={styles.avatarAllText}>@</Text>
                  </View>
                  <View style={styles.userItemInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {pinned.nickname || pinned.userID}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

          {filteredGroups.map((group) => (
            <View
              key={group.letter}
              onLayout={(e): void => {
                letterYRef.current[group.letter] = e.nativeEvent.layout.y
              }}
            >
              <View style={styles.groupHeader}>
                <Text style={styles.groupLetter}>{group.letter}</Text>
              </View>

              {group.users.map((user) => (
                <TouchableOpacity
                  key={user.userID}
                  activeOpacity={0.7}
                  style={styles.userItem}
                  onPress={(): void => handleUserSelect(user)}
                >
                  {!singleSelect && (
                    <View style={styles.checkboxWrapper}>
                      <View
                        style={[
                          styles.checkbox,
                          isUserSelected(user.userID) && styles.checkboxChecked,
                          isUserDisabled(user.userID) && styles.checkboxDisabled,
                        ]}
                      >
                        {isUserSelected(user.userID) && (
                          <Image
                            source={iconAssets['static/icon/checked.png']}
                            style={styles.checkboxIcon}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.avatar}>
                    <Avatar
                      src={user.avatarURL && user.avatarURL.length > 0 ? user.avatarURL : DEFAULT_AVATAR}
                      name={user.nickname || user.userID}
                      size={80}
                      shape="square"
                      defaultAvatarType="user"
                      pureMode
                    />
                  </View>

                  <View style={styles.userItemInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.nickname || user.userID}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {showEmpty && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.alphabetIndex}>
          {alphabetList.map((letter) => (
            <TouchableOpacity
              key={letter}
              activeOpacity={0.7}
              style={styles.alphabetItem}
              onPress={(): void => handleAlphabetTap(letter)}
            >
              <Text
                style={[
                  styles.alphabetText,
                  currentLetter === letter && styles.alphabetTextActive,
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!singleSelect && (
        <View style={styles.footer}>
          <View style={styles.selectedUsers}>
            {selectedUsers.slice(0, 3).map((user) => (
              <View key={user.userID} style={styles.selectedUserAvatar}>
                <Avatar
                  src={user.avatarURL && user.avatarURL.length > 0 ? user.avatarURL : DEFAULT_AVATAR}
                  name={user.nickname || user.userID}
                  size={80}
                  shape="square"
                  defaultAvatarType="user"
                  pureMode
                />
              </View>
            ))}
            {selectedUsers.length > 3 && (
              <View style={[styles.selectedUserAvatar, styles.selectedUserMore]}>
                <Text style={styles.moreText}>
                  +{selectedUsers.length - 3}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.confirmButton,
              selectedUsers.length === 0 && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedUsers.length === 0}
          >
            <Text style={styles.confirmButtonText}>
              {t('userPicker.confirm')}({selectedUsers.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  userPicker: {
    flex: 1,
    backgroundColor: '#F0F2F7',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: rpxToPx(32),
    paddingVertical: rpxToPx(24),
  },
  searchContainer: {
    height: rpxToPx(80),
    backgroundColor: '#F0F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(24),
    borderRadius: rpxToPx(8),
  },
  searchIconText: {
    fontSize: rpxToPx(28),
    marginRight: rpxToPx(16),
    color: '#999999',
  },
  searchIcon: {
    width: rpxToPx(28),
    height: rpxToPx(28),
    marginRight: rpxToPx(16),
  },
  searchInput: {
    flex: 1,
    fontSize: rpxToPx(28),
    color: '#333333',
    height: rpxToPx(72),
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  userList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pinnedGroup: {
    backgroundColor: '#FFFFFF',
  },
  userItemPinned: {
    height: rpxToPx(120),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  groupHeader: {
    height: rpxToPx(60),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: rpxToPx(32),
  },
  groupLetter: {
    fontSize: rpxToPx(28),
    color: '#888888',
    fontWeight: '500',
  },
  userItem: {
    height: rpxToPx(120),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  checkboxWrapper: {
    width: rpxToPx(48),
    height: rpxToPx(48),
    marginRight: rpxToPx(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: rpxToPx(48),
    height: rpxToPx(48),
    borderRadius: rpxToPx(24),
    borderWidth: rpxToPx(4),
    borderColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1C66E5',
    borderColor: '#1C66E5',
  },
  checkboxDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D9D9D9',
  },
  checkboxIconText: {
    color: '#FFFFFF',
    fontSize: rpxToPx(24),
    fontWeight: '700',
    lineHeight: rpxToPx(28),
  },
  checkboxIcon: {
    width: rpxToPx(24),
    height: rpxToPx(24),
  },
  avatar: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    marginRight: rpxToPx(24),
    borderRadius: rpxToPx(10),
    backgroundColor: '#F0F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarAll: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    marginRight: rpxToPx(24),
    backgroundColor: '#006EFF',
    borderRadius: rpxToPx(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAllText: {
    color: '#FFFFFF',
    fontSize: rpxToPx(40),
    fontWeight: '600',
  },
  avatarInitial: {
    color: '#333333',
    fontSize: rpxToPx(32),
    fontWeight: '600',
  },
  userItemInfo: {
    flex: 1,
  },
  userName: {
    fontSize: rpxToPx(32),
    color: '#333333',
  },
  alphabetIndex: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: rpxToPx(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetItem: {
    width: rpxToPx(50),
    height: rpxToPx(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetText: {
    fontSize: rpxToPx(20),
    color: '#666666',
    fontWeight: '500',
  },
  alphabetTextActive: {
    color: '#1C66E5',
    fontWeight: '700',
  },
  empty: {
    paddingVertical: rpxToPx(80),
    paddingHorizontal: rpxToPx(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: rpxToPx(26),
    color: '#8F959E',
  },
  footer: {
    height: rpxToPx(120),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(32),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  selectedUsers: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedUserAvatar: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    marginRight: rpxToPx(24),
    borderRadius: rpxToPx(10),
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedUserMore: {
    backgroundColor: '#F0F0F0',
  },
  moreText: {
    fontSize: rpxToPx(28),
    color: '#666666',
  },
  confirmButton: {
    width: rpxToPx(160),
    height: rpxToPx(72),
    backgroundColor: '#1C66E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rpxToPx(4),
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCE2FF',
  },
  confirmButtonText: {
    fontSize: rpxToPx(28),
    color: '#FFFFFF',
    fontWeight: '500',
  },
})

export default UserPickerList
