import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useContactState, useLoginState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../Avatar/Avatar'
import { rpxToPx } from '../../utils/rpxToPx'
import type { ContactInfo } from './types'
import type { AddFriendProps, AddFriendEmits } from './types'
import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'


export interface AddFriendComponentProps extends AddFriendProps {
  onUserSelect?: AddFriendEmits['onUserSelect']
  onSearch?: AddFriendEmits['onSearch']
}

export const AddFriend: React.FC<AddFriendComponentProps> = ({ Avatar = DefaultAvatar,
  onUserSelect,
  onSearch }) => {
  const { t } = useTranslation()
  const { loginUserInfo } = useLoginState()
  const { getContactInfo } = useContactState()

  const myUserID = useMemo((): string => {
    return (loginUserInfo?.userID as string) || ''
  }, [loginUserInfo])

  const [searchValue, setSearchValue] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResultList, setSearchResultList] = useState<ContactInfo[]>([])
  const [isInputActive, setIsInputActive] = useState(false)

  const inputRef = useRef<TextInput>(null)

  const handleActivateInput = (): void => {
    setIsInputActive(true)
    setTimeout((): void => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSearch = async (): Promise<void> => {
    const userID = searchValue.trim()
    if (!userID) {
      showToast(t('contact.addFriendEmpty'))
      return
    }
    Keyboard.dismiss()
    setHasSearched(true)
    setIsSearching(true)
    setSearchResultList([])
    onSearch?.(userID)
    try {
      const userList: any = await getContactInfo([userID])
      if (userList && userList.length > 0) {
        setSearchResultList(userList as ContactInfo[])
      }
    } catch (e: any) {
      console.error(`[AddFriend] search failed: ${e != null ? `${e}` : 'null'}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = (): void => {
    setSearchValue('')
    setHasSearched(false)
    setSearchResultList([])
  }

  const handleUserClick = async (user: ContactInfo): Promise<void> => {
    Keyboard.dismiss()
    let latest: ContactInfo = user
    try {
      const freshList: any = await getContactInfo([user.userID])
      if (Array.isArray(freshList) && freshList.length > 0) {
        latest = freshList[0] as ContactInfo
      }
    } catch (e: any) {
      console.error(`[AddFriend] re-fetch user failed: ${e != null ? `${e}` : 'null'}`)
    }
    onUserSelect?.(latest)
  }

  useEffect(() => {
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        {!isInputActive ? (
          <TouchableOpacity
            style={styles.searchWrapper}
            activeOpacity={0.7}
            onPress={handleActivateInput}
          >
            <Avatar src={iconAssets['static/icon/search.png']} name="" size={32} shape="square" pureMode />
            <Text style={styles.searchPlaceholderTextFlex}>{t('contact.searchUserPlaceholder')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchWrapper}>
            <Avatar src={iconAssets['static/icon/search.png']} name="" size={32} shape="square" pureMode />
            <View style={styles.searchInputArea}>
              {searchValue.length === 0 ? (
                <Text
                  style={styles.searchPlaceholderText}
                  pointerEvents="none"
                >
                  {t('contact.searchUserPlaceholder')}
                </Text>
              ) : null}
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder=""
                autoFocus
                returnKeyType="search"
                onSubmitEditing={(): void => {
                  handleSearch()
                }}
              />
            </View>
            {searchValue ? (
              <TouchableOpacity
                style={styles.searchClear}
                activeOpacity={0.7}
                onPress={handleClear}
              >
                <Avatar src={iconAssets['static/icon/close.png']} name="" size={28} shape="square" pureMode />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      {!hasSearched && myUserID ? (
        <View style={styles.myId}>
          <Text style={styles.myIdText}>{t('contact.myUserID', { userID: myUserID })}</Text>
        </View>
      ) : null}

      {hasSearched ? (
        <ScrollView style={styles.result} keyboardShouldPersistTaps="handled">
          {isSearching ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>{t('common.searching')}</Text>
            </View>
          ) : searchResultList.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('contact.userNotExist')}</Text>
            </View>
          ) : (
            searchResultList.map((user) => (
              <TouchableOpacity
                key={user.userID}
                style={styles.user}
                activeOpacity={0.7}
                onPress={(): void => handleUserClick(user)}
              >
                <Avatar
                  src={user.avatarURL || ''}
                  name={user.nickname || user.userID || ''}
                  size={80}
                  shape="square"
                  defaultAvatarType="user"
                  pureMode
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.nickname || user.userID}
                  </Text>
                  <View style={styles.userIdWrapper}>
                    <Text style={[styles.userText, styles.userLabel]}>ID: </Text>
                    <Text style={[styles.userText, styles.userId]}>{user.userID}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F2F3F5' },
  search: { flexDirection: 'row',
    alignItems: 'center',
    paddingTop: rpxToPx(16),
    paddingBottom: rpxToPx(32),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  searchWrapper: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F7',
    borderRadius: rpxToPx(8),
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(24) },
  searchPlaceholderText: { position: 'absolute',
    left: rpxToPx(12),
    right: 0,
    top: 0,
    bottom: 0,
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(46),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    textAlignVertical: 'center' },  
  searchPlaceholderTextFlex: { flex: 1,
    marginLeft: rpxToPx(12),
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(46),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)' },
  searchInputArea: {
    flex: 1,
    height: rpxToPx(46),  
    justifyContent: 'center' },
  searchInput: { position: 'absolute',
    left: rpxToPx(12),
    right: 0,
    top: 0,
    bottom: 0,
    fontSize: rpxToPx(28),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
    padding: 0 },
  searchClear: { padding: rpxToPx(8),
    marginLeft: rpxToPx(8) },
  myId: { marginTop: rpxToPx(150),
    alignItems: 'center' },
  myIdText: { fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)' },
  result: { flex: 1 },
  loading: { marginTop: rpxToPx(120),
    alignItems: 'center' },
  loadingText: { fontSize: rpxToPx(28),
    color: '#999999' },
  empty: { marginTop: rpxToPx(120),
    alignItems: 'center' },
  emptyText: { fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)' },
  user: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  userInfo: { flex: 1,
    marginLeft: rpxToPx(24) },
  userName: { fontSize: rpxToPx(36),
    lineHeight: rpxToPx(48),
    color: '#111111',
    fontWeight: '400' },
  userText: { fontSize: rpxToPx(24),
    lineHeight: rpxToPx(36),
    fontWeight: '400' },
  userIdWrapper: { flexDirection: 'row',
    alignItems: 'center',
    marginTop: rpxToPx(4) },
  userLabel: { color: '#999999' },
  userId: { color: '#147AFF' },
})

export default AddFriend
