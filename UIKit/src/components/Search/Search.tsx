import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useSearchState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from './utils/rpxToPx'
import { SearchBar } from './SearchBar'
import { SearchTab } from './SearchTab'
import { SearchResults } from './SearchResults'
import {
  Gender,
  KeywordListMatchMode,
  SearchEmits,
  SearchOption,
  SearchProps,
  SearchResultType,
  SearchTabValue,
  SearchType,
  UserSearchFilter,
  MessageSearchFilter,
} from './types'

import { Avatar as DefaultAvatar } from '../Avatar/Avatar'

const AsyncStorage: {
  getItem: (k: string) => Promise<string | null>
  setItem: (k: string, v: string) => Promise<void>
  removeItem: (k: string) => Promise<void>
} = (() => {
  const mem = new Map<string, string>()
  return {
    getItem: async (k) => mem.get(k) ?? null,
    setItem: async (k, v) => {
      mem.set(k, v)
    },
    removeItem: async (k) => {
      mem.delete(k)
    },
  }
})()

const SEARCH_HISTORY_KEY = 'tuikit_search_history'
const MAX_HISTORY_COUNT = 20

export interface SearchFullProps extends SearchProps {
  onMessageClick?: (data: { conversationID: string; conversationName?: string; showName?: string }) => void
  onConversationClick?: (data: { conversationID: string; showName: string }) => void
  onUserClick?: (data: { userID: string }) => void
  onGroupClick?: (data: { groupID: string; groupName: string }) => void
  onSearch?: SearchEmits['search']
  onCancel?: SearchEmits['cancel']
  onTabChange?: SearchEmits['tabChange']
  onResultItemClick?: SearchEmits['resultItemClick']
  onViewMore?: (type: SearchResultType) => void
  onHistoryClick?: (kw: string) => void
  onClearHistory?: () => void
  onCloudSearchClick?: () => void
  onMessageFilterChange?: (filter: MessageSearchFilter) => void
  onUserFilterChange?: (filter: UserSearchFilter) => void
}

const MessageAdvanced = require('./SearchAdvanced/MessageAdvanced').MessageAdvanced as any
const UserAdvanced = require('./SearchAdvanced/UserAdvanced').UserAdvanced as any

export const Search: React.FC<SearchFullProps> = (props) => {
  const { t } = useTranslation()
  const {
    conversationID = '',
    initialKeyword = '',
    initialOption,
    placeholder, 
    isCloud = false,
    autoFocus = true,
    showCancel = true,
    debounceTime = 300,
    SearchBar: SearchBarProp,
    SearchResults: SearchResultsProp,
    SearchAdvanced: SearchAdvancedProp,
    SearchTab: SearchTabProp,
    PlaceholderPresearch,
    PlaceholderLoading,
    PlaceholderEmpty,
    SearchResultItem,
    Avatar,
    onSearch,
    onCancel: onCancelEmit,
    onTabChange: onTabChangeEmit,
    onResultItemClick,
    onMessageClick,
    onConversationClick,
    onUserClick,
    onGroupClick,
    onViewMore,
    onHistoryClick: onHistoryClickEmit,
    onClearHistory: onClearHistoryEmit,
    onCloudSearchClick: onCloudSearchClickEmit,
    onMessageFilterChange,
    onUserFilterChange,
  } = props

  const searchStoreID = conversationID || 'default_search_store'

  const state = useSearchState(searchStoreID)

  const [keyword, setKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPresearch, setShowPresearch] = useState(true)
  const [currentTab, setCurrentTab] = useState<SearchTabValue>(SearchTabValue.All)
  const [isCloudSearch, setIsCloudSearch] = useState(isCloud)
  const [userFilter, setUserFilter] = useState<UserSearchFilter>(initialOption?.userFilter || {})
  const [messageFilter, setMessageFilter] = useState<MessageSearchFilter>(initialOption?.messageFilter || {})
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchBarRef = useRef<any>(null)

  const SearchBarComponent = (SearchBarProp as any) || SearchBar
  const SearchResultsComponent = (SearchResultsProp as any) || SearchResults
  const SearchTabComponent = (SearchTabProp as any) || SearchTab
  const SearchAdvancedComponent = SearchAdvancedProp as any

  const DEFAULT_TABS = useMemo(() => [
    { label: t('search.tabAll'), value: SearchTabValue.All },
    { label: t('search.tabUser'), value: SearchTabValue.Friend },
    { label: t('search.tabGroup'), value: SearchTabValue.Group },
    { label: t('search.tabMessage'), value: SearchTabValue.Message },
  ], [t])

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY)
        if (raw) setSearchHistory(JSON.parse(raw))
      } catch (e) {
        console.error('[Search] Load search history failed:', e)
      }
    })()
  }, [])

  useEffect(() => {
    if (initialKeyword && !keyword) {
      setKeyword(initialKeyword)
      void doSearch(initialKeyword)
    }
  }, [initialKeyword])

  useEffect(() => {
    if (initialOption?.userFilter) setUserFilter(initialOption.userFilter)
    if (initialOption?.messageFilter) setMessageFilter(initialOption.messageFilter)
  }, [initialOption?.userFilter, initialOption?.messageFilter])

  useEffect(() => {
    if (!autoFocus) return
    const delay = Platform.OS === 'ios' ? 500 : 200
    const timer = setTimeout(() => {
      searchBarRef.current?.focus?.()
    }, delay)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (Platform.OS === 'ios') {
        return
      }
      try {
        state.destroyStore()
      } catch (e) {
        console.error('[Search] destroyStore failed:', e)
      }
    }
  }, [])

  const isConversationSearch = !!conversationID

  const showTab = useMemo(() => {
    if (isConversationSearch) return false
    return keyword.trim().length > 0 && !showPresearch
  }, [isConversationSearch, keyword, showPresearch])

  const filteredFriendList = useMemo(() => {
    if (isConversationSearch) return []
    if (currentTab === SearchTabValue.All || currentTab === SearchTabValue.Friend) {
      return (state.friendList as any[]) ?? []
    }
    return []
  }, [isConversationSearch, currentTab, state.friendList])

  const filteredGroupList = useMemo(() => {
    if (isConversationSearch) return []
    if (currentTab === SearchTabValue.All || currentTab === SearchTabValue.Group) {
      return (state.groupList as any[]) ?? []
    }
    return []
  }, [isConversationSearch, currentTab, state.groupList])

  const filteredMessageResults = useMemo(() => {
    if (currentTab === SearchTabValue.All || currentTab === SearchTabValue.Message) {
      return (state.messageResults as any[]) ?? []
    }
    return []
  }, [currentTab, state.messageResults])

  const groupMemberListData = useMemo(() => {
    return (state.groupMemberList as Record<string, any[]>) ?? {}
  }, [state.groupMemberList])

  const saveSearchHistory = async (kw: string) => {
    if (!kw.trim() || conversationID) return
    let next = searchHistory.filter((h) => h !== kw)
    next = [kw, ...next]
    if (next.length > MAX_HISTORY_COUNT) next = next.slice(0, MAX_HISTORY_COUNT)
    setSearchHistory(next)
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
    } catch (e) {
      console.error('[Search] Save search history failed:', e)
    }
  }

  const clearSearchHistory = async () => {
    setSearchHistory([])
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      console.error('[Search] Clear search history failed:', e)
    }
  }

  const doSearch = async (kw: string) => {
    if (!kw.trim()) {
      setShowPresearch(true)
      state.clearSearchResults()
      return
    }
    setShowPresearch(false)
    setIsLoading(true)

    const searchScope: SearchType[] = [SearchType.FRIEND, SearchType.GROUP, SearchType.MESSAGE]

    const option: SearchOption = {
      keywordListMatchMode: KeywordListMatchMode.OR,
      pageSize: 20,
      searchScope,
      userFilter,
      messageFilter,
    }

    if (isConversationSearch) {
      option.messageFilter = {
        ...option.messageFilter,
        conversationID,
      }
    }

    onSearch?.(kw, option)

    try {
      await state.search([kw], option as any)
      await saveSearchHistory(kw)
    } catch (error: any) {
      console.error('[Search] Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (kw: string) => {
    if (debounceTime > 0) {
      setTimeout(() => doSearch(kw), debounceTime)
    } else {
      void doSearch(kw)
    }
  }

  const handleCancel = () => {
    setKeyword('')
    setShowPresearch(true)
    setCurrentTab(SearchTabValue.All)
    state.clearSearchResults()
    onCancelEmit?.()
  }

  const handleFocus = () => {
    if (!keyword) setShowPresearch(true)
  }

  const handleClear = () => {
    setShowPresearch(true)
    setCurrentTab(SearchTabValue.All)
    state.clearSearchResults()
  }

  const handleContainerClick = () => {
    searchBarRef.current?.blur?.()
  }

  const handleTabChange = (tab: SearchTabValue) => {
    setCurrentTab(tab)
    onTabChangeEmit?.(tab)

    if (tab === SearchTabValue.All && !conversationID) {
      const hasFilter = Object.keys(messageFilter).length > 0 || Object.keys(userFilter).length > 0
      if (hasFilter) {
        setMessageFilter({})
        setUserFilter({})
        if (keyword.trim()) void doSearch(keyword)
      }
    }
  }

  const handleMessageFilterChange = (filter: MessageSearchFilter) => {
    setMessageFilter(filter)
    onMessageFilterChange?.(filter)
    if (keyword.trim()) void doSearch(keyword)
  }

  const handleUserFilterChange = (filter: UserSearchFilter) => {
    setUserFilter(filter)
    onUserFilterChange?.(filter)
    if (keyword.trim()) void doSearch(keyword)
  }

  const handleResultItemClick = (
    type: SearchResultType | 'conversation',
    data: any
  ): void => {
    if (type === 'message' && onMessageClick) {
      onMessageClick(data)
    } else if (type === 'conversation' && onConversationClick) {
      onConversationClick(data)
    } else if (type === 'user' && onUserClick) {
      onUserClick(data)
    } else if (type === 'friend' && onUserClick) {
      onUserClick(data)
    } else if (type === 'group' && onGroupClick) {
      onGroupClick(data)
    } else if (type === 'groupMember' && onUserClick) {
      onUserClick(data)
    }
    onResultItemClick?.(type, data)
  }

  const handleViewMore = async (type: SearchResultType) => {
    if (currentTab === SearchTabValue.All) {
      const targetTabMap: Partial<Record<SearchResultType, SearchTabValue>> = {
        user: SearchTabValue.Friend,
        friend: SearchTabValue.Friend,
        group: SearchTabValue.Group,
        groupMember: SearchTabValue.Group,
        message: SearchTabValue.Message,
      }
      const targetTab = targetTabMap[type]
      if (targetTab) setCurrentTab(targetTab)
    } else {
      const typeValue: Record<SearchResultType, number> = {
        user: 0,
        friend: 0,
        group: 1,
        groupMember: 2,
        message: 3,
      }
      const searchTypeNum = typeValue[type]
      if (searchTypeNum != null) {
        try {
          await state.searchMore(searchTypeNum)
        } catch (error: any) {
          console.error('[Search] View more failed:', error)
        }
      }
    }
    onViewMore?.(type)
  }

  const handleHistoryClick = (kw: string) => {
    setKeyword(kw)
    void doSearch(kw)
    onHistoryClickEmit?.(kw)
  }

  const handleClearHistory = () => {
    void clearSearchHistory()
    onClearHistoryEmit?.()
  }

  const handleCloudSearchClick = () => {
    setIsCloudSearch(true)
    onCloudSearchClickEmit?.()
    if (keyword.trim()) void doSearch(keyword)
  }

  return (
    <View style={styles.container} onTouchStart={handleContainerClick}>
      <SearchBarComponent
        ref={searchBarRef}
        modelValue={keyword}
        placeholder={placeholder ?? t('common.search')}
        autoFocus={false}
        showCancel={showCancel}
        onUpdateModelValue={setKeyword}
        onSearch={handleSearch}
        onCancel={handleCancel}
        onFocus={handleFocus}
        onClear={handleClear}
      />

      {showTab ? (
        <SearchTabComponent
          modelValue={currentTab}
          tabs={DEFAULT_TABS}
          onUpdateModelValue={(v: SearchTabValue) => handleTabChange(v)}
          onChange={(v: SearchTabValue) => handleTabChange(v)}
        />
      ) : null}

      {SearchAdvancedComponent && currentTab !== SearchTabValue.All ? (
        <SearchAdvancedComponent
          currentTab={currentTab}
          isCloudSearch={isCloudSearch}
          conversationID={conversationID}
          onMessageFilterChange={handleMessageFilterChange}
          onUserFilterChange={handleUserFilterChange}
        />
      ) : null}

      {false && !SearchAdvancedComponent && currentTab === SearchTabValue.Message && !isConversationSearch ? (
        <MessageAdvanced
          startDate={messageFilter.searchTimePosition ? String(messageFilter.searchTimePosition) : ''}
          endDate={messageFilter.searchTimePeriod ? String(messageFilter.searchTimePeriod) : ''}
          onUpdateStartDate={(v: string) =>
            setMessageFilter((f) => ({
              ...f,
              searchTimePosition: v ? new Date(v).getTime() : undefined,
            }))
          }
          onUpdateEndDate={(v: string) =>
            setMessageFilter((f) => ({
              ...f,
              searchTimePeriod: v ? new Date(v).getTime() : undefined,
            }))
          }
          onChange={(_s: string, _e: string) => {
            onMessageFilterChange?.(messageFilter)
            if (keyword.trim()) void doSearch(keyword)
          }}
        />
      ) : null}

      {false && !SearchAdvancedComponent && currentTab === SearchTabValue.Friend && !isConversationSearch ? (
        <UserAdvanced
          minBirthday={userFilter.minBirthday}
          maxBirthday={userFilter.maxBirthday}
          gender={userFilter.gender}
          onUpdateMinBirthday={(v: number | undefined) => setUserFilter((f) => ({ ...f, minBirthday: v }))}
          onUpdateMaxBirthday={(v: number | undefined) => setUserFilter((f) => ({ ...f, maxBirthday: v }))}
          onUpdateGender={(v: Gender) => setUserFilter((f) => ({ ...f, gender: v }))}
          onChange={(minB: number | undefined, maxB: number | undefined, g: Gender) => {
            onUserFilterChange?.(userFilter)
            if (keyword.trim()) void doSearch(keyword)
          }}
        />
      ) : null}

      <SearchResultsComponent
        keyword={keyword}
        conversationID={conversationID}
        currentTab={currentTab}
        isLoading={isLoading}
        showPresearch={showPresearch}
        friendList={filteredFriendList}
        groupList={filteredGroupList}
        groupMemberList={groupMemberListData}
        messageResults={filteredMessageResults}
        hasMoreFriend={Boolean(state.hasMoreFriends)}
        hasMoreGroup={Boolean(state.hasMoreGroups)}
        hasMoreGroupMember={Boolean(state.hasMoreGroupMembers)}
        hasMoreMessage={Boolean(state.hasMoreMessageResults)}
        searchHistory={searchHistory}
        showCloudSearch={!isCloudSearch && showPresearch}
        SearchResultItem={SearchResultItem}
        PlaceholderEmpty={PlaceholderEmpty}
        PlaceholderLoading={PlaceholderLoading}
        PlaceholderPresearch={PlaceholderPresearch}
        Avatar={Avatar}
        onResultItemClick={(t: any, d: any) => handleResultItemClick(t, d)}
        onViewMore={(t: any) => handleViewMore(t)}
        onHistoryClick={handleHistoryClick}
        onClearHistory={handleClearHistory}
        onCloudSearchClick={handleCloudSearchClick}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
})

export default Search
