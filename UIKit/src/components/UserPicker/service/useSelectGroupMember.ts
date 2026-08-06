import {
  useGroupMemberState,
  useSearchState,
  useLoginState,
} from 'tuikit-atomicx-react-native'
import { useEffect, useRef, useState } from 'react'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { AT_ALL_TAG } from '../utils/mention'
import { SearchType, KeywordListMatchMode } from '../types/search'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_INSTANCE_ID = 'groupMemberPicker_search'

export interface UseSelectGroupMemberOptions {
  conversationID?: string
  excludeSelf?: boolean
  maxCount?: number
  title?: string
  singleSelect?: boolean
  enableAtAll?: boolean
  enableRemoteSearch?: boolean
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useSelectGroupMember(
  routeParams?: any
): UserPickerHookResult {
  const options: UseSelectGroupMemberOptions = routeParams ?? {}
  const { t } = useTranslation()
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)
  const excludeSelf: boolean = options.excludeSelf ?? true
  const maxCount: number = options.maxCount ?? 500
  const title: string = options.title ?? t('userPicker.selectTitle')
  const singleSelect: boolean = !!options.singleSelect
  const enableAtAll: boolean = !!options.enableAtAll
  const enableRemoteSearch: boolean = !!options.enableRemoteSearch

  const groupMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )
  const allMembers: any[] = groupMemberState?.memberList ?? []
  const hasMoreMembers: boolean = groupMemberState?.hasMoreMembers === true

  const { loginUserInfo, getLoginUserInfo } = useLoginState()
  const [loginTick, setLoginTick] = useState<number>(0)
  useEffect((): void => {
    setLoginTick((t) => t + 1)
  }, [loginUserInfo])

  const searchState = useSearchState(SEARCH_INSTANCE_ID)
  const searchKeywordRef = useRef<string>('')

  const searchResultList: any[] = (() => {
    if (!searchState) return []
    const map: Record<string, any[]> = searchState.groupMemberList ?? {}
    return map[groupID] ?? []
  })()

  useEffect((): void => {
    if (
      enableRemoteSearch &&
      groupMemberState &&
      allMembers.length === 0 &&
      typeof (groupMemberState as any).loadMembers === 'function'
    ) {
      ;(groupMemberState as any).loadMembers().catch((err: any) => {
        console.error('[useSelectGroupMember] loadMembers failed:', err)
      })
    }
  }, [enableRemoteSearch, groupID])

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userList: User[] = (() => {
    const isSearching =
      enableRemoteSearch && searchKeywordRef.current.trim().length > 0
    const source: any[] = isSearching ? searchResultList : allMembers || []
    const me: string = loginUserInfo?.userID ?? '';
    const meEffective: string = me + (loginTick >= 0 ? '' : '')
    const filtered = excludeSelf
      ? source.filter((m: any): boolean => {
          if (meEffective.length === 0) return true
          const mUID: any = m?.userID
          const mUIDStr: string =
            typeof mUID === 'string' ? mUID : typeof mUID === 'number' ? `${mUID}` : ''
          if (mUIDStr.length === 0) return true
          const isMatch: boolean =
            mUIDStr === meEffective ||
            mUIDStr.indexOf(meEffective) >= 0 ||
            meEffective.indexOf(mUIDStr) >= 0
          if (isMatch) return false
          return true
        })
      : source
    return filtered.map((m: any) => ({
      userID: m?.userID ?? '',
      nickname: m?.nameCard || m?.nickname || m?.userID || '',
      avatarURL: m?.avatarURL || '',
    }))
  })()

  const pinnedTopItems: User[] = enableAtAll
    ? [
        {
          userID: AT_ALL_TAG,
          nickname: t('userPicker.selectAll'),
          avatarURL: '',
        },
      ]
    : []

  const lockedItems: string[] = []
  const hasMore: boolean = hasMoreMembers

  const onSearchChange: ((keyword: string) => Promise<void> | void) | undefined =
    enableRemoteSearch && searchState
      ? async (kw: string): Promise<void> => {
          searchKeywordRef.current = kw
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
          }
          await new Promise<void>((resolve) => {
            debounceTimerRef.current = setTimeout(() => {
              debounceTimerRef.current = null
              resolve()
            }, SEARCH_DEBOUNCE_MS)
          })
          const trimmed = kw.trim()
          if (!trimmed) {
            try {
              searchState.clearSearchResults()
            } catch (e) {
              console.error('[useSelectGroupMember] clearSearchResults failed:', e)
            }
            return
          }
          try {
            searchState.search([trimmed], {
              keywordListMatchMode: KeywordListMatchMode.OR,
              searchScope: [SearchType.GROUP_MEMBER],
              pageSize: 100,
              groupMemberFilter: { groupIDList: [groupID] },
            })
          } catch (err: any) {
            console.error('[useSelectGroupMember] search failed:', err?.code)
            let toastTitle = t('userPicker.searchFailed')
            if (err && err.code === 7013) {
              toastTitle = t('userPicker.premiumOnly')
            } else if (err && err.message) {
              toastTitle = err.message
            }
            showToast(toastTitle)
          }
        }
      : undefined

  const cleanup = (): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (searchState) {
      try {
        ;(searchState as any).destroyStore?.()
      } catch (e) {
        console.error('[useSelectGroupMember] destroyStore failed:', e)
      }
    }
    if (groupMemberState) {
      try {
        ;(groupMemberState as any).destroyStore?.()
      } catch (e) {
        console.error(
          '[useSelectGroupMember] destroyStore (groupMember) failed:',
          e
        )
      }
    }
  }

  useEffect(() => {
    return (): void => {
      cleanup()
    }
  }, [])

  const handleConfirm = async (_selectedUsers: User[]): Promise<void> => {
    cleanup()
  }

  const handleCancel = async (): Promise<void> => {
    cleanup()
  }

  const onReachEnd = async (): Promise<void> => {
    const isSearching =
      enableRemoteSearch && searchKeywordRef.current.trim().length > 0
    if (isSearching) return
    if (!groupMemberState) return
    if (!hasMoreMembers) return
    try {
      await (groupMemberState as any).loadMoreMembers()
    } catch (err) {
      console.error('[useSelectGroupMember] loadMoreMembers failed:', err)
    }
  }

  return {
    userList,
    lockedItems,
    maxCount,
    title,
    hasMore,
    handleConfirm,
    handleCancel,
    onReachEnd,
    singleSelect,
    pinnedTopItems,
    onSearchChange,
  }
}
