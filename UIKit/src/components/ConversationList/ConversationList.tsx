import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useConversationListState, ReceiveMessageOpt } from 'tuikit-atomicx-react-native'
import { SwipeActions } from '../SwipeActions/SwipeActions'
import { ConversationPreview as DefaultPreview } from './ConversationPreview'
import { ConversationActions as DefaultConversationActions } from './ConversationActions'
import type { ConversationInfo } from './types'
import { Avatar as DefaultAvatar } from '../Avatar/Avatar'
import { EmptyListPlaceholder } from './placeholders/EmptyList'
import { LoadingPlaceholder } from './placeholders/Loading'
import { LoadErrorPlaceholder } from './placeholders/LoadError'
import type {
  ActionItem,
  ConversationListProps,
  ConversationListEmits,
} from './types'
import { ReceiveMessageOpt as ReceiveMessageOptLocal } from './types'

export interface ConversationListComponentProps extends ConversationListProps {
  onConversationClick?: (conv: ConversationInfo) => void
  onPin?: (conversationID: string, isPinned: boolean) => void
  onMute?: (conversationID: string, isMuted: boolean) => void
  onDelete?: (conversationID: string) => void
  onLoadError?: (error: Error) => void
}

export const ConversationList: React.FC<ConversationListComponentProps> = (props) => {
  const {
    actionsConfig = {
      isSupportPin: true,
      isSupportMute: true,
      isSupportDelete: true,
    },
    Preview = DefaultPreview,
    ConversationActions = DefaultConversationActions,
    Avatar: AvatarProp = DefaultAvatar,
    PlaceholderEmptyList = EmptyListPlaceholder,
    PlaceholderLoading = LoadingPlaceholder,
    PlaceholderLoadError = LoadErrorPlaceholder,
    filter,
    sort,
    onConversationClick,
    onPin,
    onMute,
    onDelete,
    onLoadError,
  } = props

  const convListState = useConversationListState('ConvList')
  const rawList: any = (convListState as any).conversationList

  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [currentActivator, setCurrentActivator] = useState<string | null>(null)

  const loadedInstances: Set<string> = (ConversationList as any).__loadedInstances
    ?? ((ConversationList as any).__loadedInstances = new Set<string>())

  useEffect(() => {
    if (loadedInstances.has('ConvList')) {
      setIsLoading(false)
      return
    }
    if (typeof (convListState as any).loadConversations !== 'function') return
    loadedInstances.add('ConvList')
    setIsLoading(true)
    ;(convListState as any)
      .loadConversations(JSON.stringify({ count: 100 }))
      .then((): void => {
        setIsLoading(false)
        setLoadError(null)
      })
      .catch((err: any): void => {
        setIsLoading(false)
        const e: Error = err instanceof Error ? err : new Error(String(err))
        setLoadError(e)
        onLoadError?.(e)
      })
  }, [convListState])

  const filteredAndSortedList = useMemo((): ConversationInfo[] => {
    const list: ConversationInfo[] = Array.isArray(rawList) ? (rawList as ConversationInfo[]) : []
    let result = [...list]
    if (filter) {
      result = result.filter(filter)
    }
    if (sort) {
      result.sort(sort)
    }
    return result
  }, [rawList, filter, sort])

  const computedActionsWidth = useMemo((): number => {
    if (actionsConfig.actions && actionsConfig.actions.length > 0) {
      return actionsConfig.actions.length * 160
    }
    let count = 0
    if (actionsConfig.isSupportPin !== false) count++
    if (actionsConfig.isSupportMute !== false) count++
    if (actionsConfig.isSupportDelete !== false) count++
    return count * 160 || 480
  }, [actionsConfig])

  const hasVisibleActions = useMemo((): boolean => {
    if (actionsConfig.actions && actionsConfig.actions.length > 0) {
      return true
    }
    return (
      actionsConfig.isSupportPin === true ||
      actionsConfig.isSupportMute === true ||
      actionsConfig.isSupportDelete === true
    )
  }, [actionsConfig])

  const handleTouchStart = useCallback((conversationID: string): void => {
    setCurrentActivator(conversationID)
  }, [])

  const handleSwipeOpen = useCallback((conversationID: string): void => {
    setCurrentActivator(conversationID)
  }, [])

  const closeSwipeAction = useCallback((): void => {
    setCurrentActivator(null)
  }, [])

  const handleConversationTap = useCallback(
    (conversation: ConversationInfo): void => {
      if (currentActivator != null && currentActivator !== conversation.conversationID) {
        closeSwipeAction()
      } else {
        if (conversation.unreadCount > 0) {
          if (typeof (convListState as any).clearConversationUnreadCount === 'function') {
            (convListState as any).clearConversationUnreadCount(conversation.conversationID).catch((): void => {
            })
          }
        }
      }
      onConversationClick?.(conversation)
    },
    [currentActivator, closeSwipeAction, convListState, onConversationClick]
  )

  const handlePin = useCallback(
    async (conversationID: string, isPinned: boolean): Promise<void> => {
      try {
        onPin?.(conversationID, isPinned)
        if (typeof (convListState as any).pinConversation === 'function') {
          await (convListState as any).pinConversation(conversationID, isPinned)
        }
      } catch {
      } finally {
        closeSwipeAction()
      }
    },
    [convListState, onPin, closeSwipeAction]
  )

  const handleMute = useCallback(
    async (conversationID: string, isMuted: boolean): Promise<void> => {
      try {
        onMute?.(conversationID, isMuted)
        if (typeof (convListState as any).setReceiveMessageOpt === 'function') {
          await (convListState as any).setReceiveMessageOpt(
            conversationID,
            isMuted ? 2 : 0
          )
        }
      } catch {
      } finally {
        closeSwipeAction()
      }
    },
    [convListState, onMute, closeSwipeAction]
  )

  const handleDelete = useCallback(
    async (conversationID: string): Promise<void> => {
      try {
        onDelete?.(conversationID)
        if (typeof (convListState as any).deleteConversation === 'function') {
          await (convListState as any).deleteConversation(conversationID)
        }
      } catch {
      } finally {
        closeSwipeAction()
      }
    },
    [convListState, onDelete, closeSwipeAction]
  )

  if (isLoading && PlaceholderLoading) {
    return (
      <View style={styles.placeholder}>
        <PlaceholderLoading />
      </View>
    )
  }
  if (loadError && PlaceholderLoadError) {
    return (
      <View style={styles.placeholder}>
        <PlaceholderLoadError error={loadError} />
      </View>
    )
  }
  if (filteredAndSortedList.length === 0 && PlaceholderEmptyList) {
    return (
      <View style={styles.placeholder}>
        <PlaceholderEmptyList />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAndSortedList.map((item) => (
          <SwipeActions
            key={item.conversationID}
            actionsWidth={computedActionsWidth}
            disabled={!hasVisibleActions}
            currentActivator={currentActivator}
            selfKey={item.conversationID}
            onTouchStart={(): void => handleTouchStart(item.conversationID)}
            onContentTap={(): void => handleConversationTap(item)}
            onOpen={(): void => handleSwipeOpen(item.conversationID)}
            actionsSlot={
              hasVisibleActions ? (
                <ConversationActions
                  conversation={item}
                  actions={actionsConfig.actions}
                  isSupportPin={actionsConfig.isSupportPin}
                  isSupportMute={actionsConfig.isSupportMute}
                  isSupportDelete={actionsConfig.isSupportDelete}
                  onPin={handlePin}
                  onMute={handleMute}
                  onDelete={handleDelete}
                />
              ) : undefined
            }
          >
            <Preview conversation={item} />
          </SwipeActions>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
})

export default ConversationList
export type { ConversationListProps, ConversationListEmits, ActionItem, ConversationInfo }
