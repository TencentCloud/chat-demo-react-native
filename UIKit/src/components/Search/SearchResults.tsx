import React, { useMemo } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from './utils/rpxToPx'
import { SearchResultsEmits, SearchResultsProps, SearchResultType, SearchTabValue } from './types'
import { SearchResultsEmpty } from './placeholders/SearchResultsEmpty'
import { SearchResultsLoading } from './placeholders/SearchResultsLoading'
import { SearchResultsPresearchFull } from './placeholders/SearchResultsPresearch'
import { SearchResultItem } from './SearchResultItem'

import { Avatar as DefaultAvatar } from '../Avatar/Avatar'
import { useTranslation } from 'react-i18next'

const DEFAULT_DISPLAY_COUNT = 3

export interface SearchResultsFullProps extends SearchResultsProps {
  onResultItemClick?: SearchResultsEmits['resultItemClick']
  onViewMore?: SearchResultsEmits['viewMore']
  onHistoryClick?: SearchResultsEmits['historyClick']
  onClearHistory?: SearchResultsEmits['clearHistory']
  onCloudSearchClick?: SearchResultsEmits['cloudSearchClick']
}

export const SearchResults: React.FC<SearchResultsFullProps> = (props) => {
  const { t } = useTranslation()
  const {
    keyword = '',
    conversationID = '',
    currentTab = SearchTabValue.All,
    isLoading = false,
    showPresearch = true,
    friendList = [],
    groupList = [],
    messageResults = [],
    hasMoreFriend = false,
    hasMoreGroup = false,
    hasMoreMessage = false,
    searchHistory = [],
    showCloudSearch = false,
    SearchResultItem: SearchResultItemProp,
    PlaceholderEmpty: PlaceholderEmptyProp,
    PlaceholderLoading: PlaceholderLoadingProp,
    PlaceholderPresearch: PlaceholderPresearchProp,
    Avatar: AvatarProp,
    onResultItemClick,
    onViewMore,
    onHistoryClick,
    onCloudSearchClick,
  } = props

  const isAllTab = currentTab === SearchTabValue.All
  const isConversationSearch = !!conversationID

  const SearchResultItemComponent = (SearchResultItemProp as any) || SearchResultItem
  const PresearchComponent = (PlaceholderPresearchProp as any) || SearchResultsPresearchFull
  const LoadingComponent = (PlaceholderLoadingProp as any) || SearchResultsLoading
  const EmptyComponent = (PlaceholderEmptyProp as any) || SearchResultsEmpty
  const AvatarComp = (AvatarProp as any) || DefaultAvatar

  const isEmpty = useMemo(() => {
    if (isConversationSearch) {
      return !messageResults || messageResults.length === 0
    }
    return (
      (!friendList || friendList.length === 0) &&
      (!groupList || groupList.length === 0) &&
      (!messageResults || messageResults.length === 0)
    )
  }, [isConversationSearch, friendList, groupList, messageResults])

  const displayFriendList = useMemo(() => {
    if (isAllTab) return friendList?.slice(0, DEFAULT_DISPLAY_COUNT) || []
    return friendList || []
  }, [isAllTab, friendList])

  const displayGroupList = useMemo(() => {
    if (isAllTab) return groupList?.slice(0, DEFAULT_DISPLAY_COUNT) || []
    return groupList || []
  }, [isAllTab, groupList])

  const displayMessageResults = useMemo(() => {
    if (isAllTab) return messageResults?.slice(0, DEFAULT_DISPLAY_COUNT) || []
    return messageResults || []
  }, [isAllTab, messageResults])

  const showMoreFriend = useMemo(() => {
    if (isConversationSearch) return false
    if (isAllTab) return hasMoreFriend || (friendList && friendList.length > DEFAULT_DISPLAY_COUNT)
    return hasMoreFriend
  }, [isConversationSearch, isAllTab, hasMoreFriend, friendList])

  const showMoreGroup = useMemo(() => {
    if (isConversationSearch) return false
    if (isAllTab) return hasMoreGroup || (groupList && groupList.length > DEFAULT_DISPLAY_COUNT)
    return hasMoreGroup
  }, [isConversationSearch, isAllTab, hasMoreGroup, groupList])

  const showMoreMessage = useMemo(() => {
    if (isAllTab && !isConversationSearch) {
      return hasMoreMessage || (messageResults && messageResults.length > DEFAULT_DISPLAY_COUNT)
    }
    return hasMoreMessage
  }, [isAllTab, isConversationSearch, hasMoreMessage, messageResults])

  const handleItemClick = (type: SearchResultType | 'conversation', item: any) => {
    onResultItemClick?.(type, item)
  }
  const handleViewMore = (type: SearchResultType) => onViewMore?.(type)
  const handleHistoryClick = (kw: string) => onHistoryClick?.(kw)
  const handleCloudSearchClick = () => onCloudSearchClick?.()

  if (showPresearch && !isConversationSearch) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <PresearchComponent
            searchHistory={searchHistory}
            keyword={keyword}
            showCloudSearch={showCloudSearch}
            onHistoryClick={handleHistoryClick}
            onCloudSearchClick={handleCloudSearchClick}
          />
        </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <LoadingComponent />
        </View>
      </View>
    )
  }

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyComponent keyword={keyword} />
        </View>
      </View>
    )
  }

  type ListRow =
    | { type: 'header'; key: string; title: string }
    | { type: 'friend'; key: string; data: any }
    | { type: 'group'; key: string; data: any }
    | { type: 'message'; key: string; data: any }
    | { type: 'more'; key: string; label: string; viewMoreType: SearchResultType }
    | { type: 'gap'; key: string }

  const rows: ListRow[] = []

  if (!isConversationSearch) {
    if (friendList && friendList.length > 0) {
      rows.push({ type: 'header', key: 'h-friend', title: t('search.sectionUsers') })
      displayFriendList.forEach((f) => {
        rows.push({ type: 'friend', key: `friend-${f.userID}`, data: f })
      })
      if (showMoreFriend) {
        rows.push({ type: 'more', key: 'm-friend', label: t('searchPlaceholder.viewMoreUsers'), viewMoreType: 'friend' })
      }
      rows.push({ type: 'gap', key: 'g-friend' })
    }
    if (groupList && groupList.length > 0) {
      rows.push({ type: 'header', key: 'h-group', title: t('search.sectionGroups') })
      displayGroupList.forEach((g) => {
        rows.push({ type: 'group', key: `group-${g.groupID}`, data: g })
      })
      if (showMoreGroup) {
        rows.push({ type: 'more', key: 'm-group', label: t('searchPlaceholder.viewMoreGroups'), viewMoreType: 'group' })
      }
      rows.push({ type: 'gap', key: 'g-group' })
    }
  }

  if (messageResults && messageResults.length > 0) {
    if (!isConversationSearch) {
      rows.push({ type: 'header', key: 'h-msg', title: t('searchPlaceholder.chatHistory') })
    }
    if (isConversationSearch) {
      displayMessageResults.forEach((mr) => {
        mr.messageList?.forEach((m, idx) => {
          rows.push({ type: 'message', key: `msg-${m.msgID ?? `idx-${idx}`}`, data: m })
        })
      })
    } else {
      displayMessageResults.forEach((mr, idx) => {
        rows.push({ type: 'message', key: `msg-${mr.conversationID ?? `idx-${idx}`}`, data: mr })
      })
    }
    if (showMoreMessage) {
      rows.push({ type: 'more', key: 'm-msg', label: t('searchPlaceholder.viewMoreMessages'), viewMoreType: 'message' })
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeaderCell}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
              </View>
            )
          }
          if (item.type === 'friend') {
            return (
              <View style={styles.sectionItemCell}>
                <View style={styles.itemWrapper}>
                  <SearchResultItemComponent
                    type="friend"
                    data={item.data}
                    keyword={keyword}
                    Avatar={AvatarComp}
                    onClick={(t: any, d: any) => handleItemClick(t, d)}
                  />
                </View>
              </View>
            )
          }
          if (item.type === 'group') {
            return (
              <View style={styles.sectionItemCell}>
                <View style={styles.itemWrapper}>
                  <SearchResultItemComponent
                    type="group"
                    data={item.data}
                    keyword={keyword}
                    Avatar={AvatarComp}
                    onClick={(t: any, d: any) => handleItemClick(t, d)}
                  />
                </View>
              </View>
            )
          }
          if (item.type === 'message') {
            const isConv = isConversationSearch
            return (
              <View style={styles.sectionItemCell}>
                <View style={styles.itemWrapper}>
                  <SearchResultItemComponent
                    type={isConv ? 'message' : 'conversation'}
                    data={item.data}
                    keyword={keyword}
                    Avatar={AvatarComp}
                    onClick={(t: any, d: any) => handleItemClick(t, d)}
                  />
                </View>
              </View>
            )
          }
          if (item.type === 'more') {
            return (
              <View style={styles.sectionMoreCell}>
                <TouchableOpacity
                  style={styles.sectionMore}
                  activeOpacity={0.7}
                  onPress={() => handleViewMore(item.viewMoreType)}
                >
                  <Text style={styles.sectionMoreText}>{item.label}</Text>
                </TouchableOpacity>
              </View>
            )
          }
          return <View style={styles.sectionGap} />
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: rpxToPx(3),
    borderTopColor: '#E6E9F0',
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  sectionHeaderCell: {
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: rpxToPx(20),
    paddingHorizontal: rpxToPx(40),
    paddingBottom: rpxToPx(3),
  },
  sectionTitle: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(48),
    fontWeight: '500',
    color: '#333333',
  },
  sectionMoreCell: {
    backgroundColor: '#ffffff',
  },
  sectionMore: {
    justifyContent: 'center',
    paddingTop: rpxToPx(26),
    paddingHorizontal: rpxToPx(40),
    paddingBottom: rpxToPx(11),
    backgroundColor: '#ffffff',
  },
  sectionMoreText: {
    fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#1C66E5',
  },
  sectionGap: {
    height: rpxToPx(2),
    backgroundColor: '#F5F6F7',
  },
  sectionItemCell: {
    paddingHorizontal: rpxToPx(30),
  },
  itemWrapper: {
    flex: 1,
    paddingVertical: rpxToPx(12),
    borderBottomWidth: rpxToPx(1),
    borderBottomColor: '#E6E9F0',
  },
})

export default SearchResults
