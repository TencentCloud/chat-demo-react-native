import React, { useRef, useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useGroupState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../Avatar/Avatar'
import { rpxToPx } from '../../utils/rpxToPx'
import type { GroupInfo } from './types'
import type { AddGroupProps, AddGroupEmits } from './types'
import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'


export interface AddGroupComponentProps extends AddGroupProps {
  onGroupSelect?: AddGroupEmits['onGroupSelect']
  onSearch?: AddGroupEmits['onSearch']
}

export const AddGroup: React.FC<AddGroupComponentProps> = ({ Avatar = DefaultAvatar,
  onGroupSelect,
  onSearch }) => {
  const { t } = useTranslation()
  const { getGroupInfo } = useGroupState()

  const [searchValue, setSearchValue] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResultList, setSearchResultList] = useState<GroupInfo[]>([])
  const [isInputActive, setIsInputActive] = useState(false)

  const inputRef = useRef<TextInput>(null)

  const handleActivateInput = (): void => {
    setIsInputActive(true)
    setTimeout((): void => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSearch = async (): Promise<void> => {
    const groupID = searchValue.trim()
    if (!groupID) {
      showToast(t('contact.addGroupEmpty'))
      return
    }
    Keyboard.dismiss()
    setHasSearched(true)
    setIsSearching(true)
    setSearchResultList([])
    onSearch?.(groupID)
    try {
      const info: any = await getGroupInfo(groupID)
      setSearchResultList(info ? [info as GroupInfo] : [])
    } catch (e: any) {
      console.error(`[AddGroup] search failed: ${e != null ? `${e}` : 'null'}`)
      setSearchResultList([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = (): void => {
    setSearchValue('')
    setHasSearched(false)
    setSearchResultList([])
  }

  const handleGroupClick = async (group: GroupInfo): Promise<void> => {
    Keyboard.dismiss()
    let latest: GroupInfo = group
    try {
      const fresh: any = await getGroupInfo(group.groupID)
      if (fresh) {
        latest = fresh as GroupInfo
      }
    } catch (e: any) {
      console.error(`[AddGroup] re-fetch group failed: ${e != null ? `${e}` : 'null'}`)
    }
    onGroupSelect?.(latest)
  }

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
            <Text style={styles.searchPlaceholderTextFlex}>{t('contact.searchGroupPlaceholder')}</Text>
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
                  {t('contact.searchGroupPlaceholder')}
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

      {hasSearched ? (
        <ScrollView style={styles.result} keyboardShouldPersistTaps="handled">
          {isSearching ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>{t('common.searching')}</Text>
            </View>
          ) : searchResultList.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('contact.groupNotExist')}</Text>
            </View>
          ) : (
            searchResultList.map((group) => (
              <TouchableOpacity
                key={group.groupID}
                style={styles.group}
                activeOpacity={0.7}
                onPress={(): void => handleGroupClick(group)}
              >
                <Avatar
                  src={group.avatarURL || ''}
                  name={group.groupName || group.groupID || ''}
                  size={96}
                  shape="square"
                  defaultAvatarType="public"
                  pureMode
                />
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {group.groupName || group.groupID}
                  </Text>
                  <Text style={styles.groupId}>ID: {group.groupID}</Text>
                  <Text style={styles.groupType}>{t('createGroup.groupType')}: {group.groupType}</Text>
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
    backgroundColor: '#F5F5F5' },
  search: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  searchWrapper: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F7',
    borderRadius: rpxToPx(8),
    paddingVertical: rpxToPx(16),
    paddingHorizontal: rpxToPx(24) },
  searchPlaceholderText: { position: 'absolute',
    left: rpxToPx(12),
    right: 0,
    top: 0,
    bottom: 0,
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(46),
    color: '#999999',
    textAlignVertical: 'center' },  
  searchPlaceholderTextFlex: { flex: 1,
    marginLeft: rpxToPx(12),
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(46),
    color: '#999999' },
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
    color: 'rgba(0, 0, 0, 0.9)',
    padding: 0 },
  searchClear: { padding: rpxToPx(8),
    marginLeft: rpxToPx(8) },
  result: { flex: 1 },
  loading: { paddingVertical: rpxToPx(60),
    alignItems: 'center' },
  loadingText: { fontSize: rpxToPx(28),
    color: '#999999' },
  empty: { paddingVertical: rpxToPx(60),
    alignItems: 'center' },
  emptyText: { fontSize: rpxToPx(28),
    color: '#999999' },
  group: { flexDirection: 'row',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  groupInfo: { flex: 1,
    marginLeft: rpxToPx(32) },
  groupName: { fontSize: rpxToPx(36),
    lineHeight: rpxToPx(48),
    color: '#000000',
    fontWeight: '400' },
  groupId: { fontSize: rpxToPx(26),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#888888',
    marginTop: rpxToPx(8) },
  groupType: { fontSize: rpxToPx(26),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#888888',
    marginTop: rpxToPx(4) },
})

export default AddGroup
