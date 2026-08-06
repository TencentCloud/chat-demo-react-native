import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View, type ListRenderItem, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import {
  useMessageListState,
  useConversationListState,
  MessageListType,
  MessageLoadDirection,
  MessageStatus,
  MessageType,
} from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../utils/rpxToPx'
import { fromSDKMessage, type MessageInfo } from './Message/MessageTypes'
import { MessageActions } from './Message/MessageActions'
import { MessageRenderer } from './Message'
import { MessageTimeDivider } from './MessageTimeDivider'
import { useMediaPlayer } from '../MediaPlayer/useMediaPlayer'

const SCROLL_TO_BOTTOM_THRESHOLD = 200
import { iconAssets } from '../../static/iconBase64'

const DOWN_ICON = iconAssets['static/icon/down.png']

export interface MessageListProps {
  conversationID?: string
  messageListType?: MessageListType
  alignment?: string
  messageAggregationTime?: number
  enableReadReceipt?: boolean
  messageActionList?: string[]
  filter?: (message: MessageInfo) => boolean
  locateMessage?: MessageInfo | null
  customCenterChecker?: ((message: MessageInfo, conversationID: string) => boolean) | null
  customMessageRender?: ((message: MessageInfo, conversationID: string) => React.ReactNode) | null
  navbarHeight?: number
  onMessageListTap?: () => void
  onMessageTap?: (msg: MessageInfo) => void
  EmptyPlaceholder?: React.ComponentType
}

export interface MessageListExpose {
  scrollToBottom: (animated?: boolean) => void
  scrollToMessage: (message: MessageInfo, animated?: boolean) => void
}

type MessageItem =
  | { type: 'divider'; key: string; timestamp: number }
  | {
      type: 'message'
      key: string
      message: MessageInfo
      showAvatar: boolean
      showNickname: boolean
    }

function isGroupCreateMessage(m: MessageInfo): boolean {
  try {
    const payload = (m as any).messagePayload
    if (!payload) return false
    const cd: any = (payload as any).customData
    if (!cd) return false
    const data = typeof cd === 'string' ? JSON.parse(cd) : cd
    return data?.businessID === 'group_create'
  } catch {
    return false
  }
}

const computeMessageItems = (
  messages: MessageInfo[],
  messageAggregationTime: number,
  filter: ((m: MessageInfo) => boolean) | null,
  isGroup: boolean,
  customCenterChecker: ((m: MessageInfo, cid: string) => boolean) | null,
  conversationID: string
): MessageItem[] => {
  try {
    if (!messages || messages.length === 0) return []

    const filtered = filter
      ? messages.filter(filter)
      : messages.filter((m) => (m as any).status !== MessageStatus.DELETED)

    const items: MessageItem[] = []
    const aggregationSec = messageAggregationTime

    filtered.forEach((message, index) => {
    try {
      const prevMessage = index > 0 ? filtered[index - 1] : null

      const status = (message as any).status
      const mt: number = (message as any).messageType
      const isCenterMessage =
        status === MessageStatus.REVOKED ||
        mt === MessageType.TIPS ||
        isGroupCreateMessage(message) ||
        (typeof customCenterChecker === 'function' &&
          customCenterChecker(message, conversationID))

      const showTimeDivider =
        index === 0 ||
        (prevMessage &&
          message.timestamp &&
          (prevMessage as MessageInfo).timestamp &&
          message.timestamp - (prevMessage as MessageInfo).timestamp > aggregationSec)

      if (showTimeDivider) {
        items.push({
          type: 'divider',
          key: `divider-${message.msgID}`,
          timestamp: message.timestamp,
        })
      }

      if (isCenterMessage) {
        items.push({
          type: 'message',
          key: `message-${message.msgID}`,
          message,
          showAvatar: false,
          showNickname: false,
        })
        return
      }

      const showNickname = isGroup && !message.isSelf
      const showAvatar = true

      items.push({
        type: 'message',
        key: `message-${message.msgID}`,
        message,
        showAvatar,
        showNickname,
      })
    } catch (err) {
      console.error('[MessageList] computeMessageItems forEach error at index=' + index, err, { msgID: (message as any)?.msgID, messageType: (message as any)?.messageType })
    }
  })

    return items
  } catch (err) {
    console.error('[MessageList] computeMessageItems outer error', err, { messagesLen: messages?.length, filter, isGroup, customCenterCheckerType: typeof customCenterChecker, conversationID })
    return []
  }
}

export const MessageList = forwardRef<MessageListExpose, MessageListProps>((props, ref) => {
  const { t } = useTranslation()
  const {
    messageAggregationTime = 300,
    messageActionList = [],
    filter = null,
    locateMessage: locateMessageProp = null,
    customCenterChecker = null,
    customMessageRender = null,
    bottomInset = 0,
    onMessageListTap,
    onMessageTap,
    EmptyPlaceholder: Empty = null,
  } = props

  const conversationID: string = props.conversationID ?? ''

  const { audioPlayer, videoPlayer } = useMediaPlayer()

  const autoLoadOption: any = locateMessageProp && locateMessageProp.msgID
    ? {
        cursor: locateMessageProp,
        direction: MessageLoadDirection.BOTH,
        pageCount: 30,
      }
    : null
  const msgListState = useMessageListState({ conversationID, autoLoadOption })
  const convListState = useConversationListState()

  const messages: MessageInfo[] = useMemo(() => {
    const raw = msgListState.messageList
    if (!Array.isArray(raw)) return []
    return raw.map((r) => fromSDKMessage(r))
  }, [msgListState.messageList])

  const isGroup = conversationID.startsWith('group_')

  const messageItems: MessageItem[] = useMemo(
    () => {
      try {
        const items = computeMessageItems(
          messages,
          messageAggregationTime,
          filter,
          isGroup,
          customCenterChecker,
          conversationID
        )
        return items.slice().reverse()
      } catch (err) {
        console.error('[MessageList] messageItems useMemo error', err)
        return []
      }
    },
    [messages, messageAggregationTime, filter, isGroup, customCenterChecker, conversationID]
  )

  useEffect(() => {
    if (conversationID.length === 0) return
    if (locateMessageProp && locateMessageProp.msgID) {
      setLocating(true)
      msgListState
        .loadMessages({
          cursor: locateMessageProp as any,
          direction: MessageLoadDirection.BOTH,
          pageCount: 30,
        })
        .then((): void => {
          setLocating(false)
        })
        .catch((e: any | null): void => {
          console.error(
            `[MessageList] initial loadMessages (with locateMessage) failed: ${e != null ? `${e}` : 'null'}`
          )
          setLocating(false)
        })
      return
    }
    msgListState
      .loadMessages({ pageCount: 30 })
      .catch((e: any | null): void => {
        console.error(`[MessageList] loadMessages failed: ${e != null ? `${e}` : 'null'}`)
      })
  }, [msgListState, conversationID])

  useEffect(() => {
    return (): void => {
      try {
        msgListState.destroyStore()
      } catch {
      }
      if (conversationID.length > 0) {
        (convListState as any).clearConversationUnreadCount(conversationID).catch(() => undefined)
      }
    }
  }, [conversationID])

  const isLocatingRef = useRef(false)
  const locatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setLocating = useCallback((val: boolean): void => {
    isLocatingRef.current = val
    if (locatingTimerRef.current != null) {
      clearTimeout(locatingTimerRef.current)
      locatingTimerRef.current = null
    }
    if (val) {
      locatingTimerRef.current = setTimeout((): void => {
        isLocatingRef.current = false
        locatingTimerRef.current = null
      }, 2500)
    }
  }, [])

  const [actionsVisible, setActionsVisible] = useState(false)
  const [activeMsg, setActiveMsg] = useState<MessageInfo | null>(null)
  useEffect(() => {
    if (!activeMsg) return
    const id: string = (activeMsg as any).msgID ?? ''
    if (id.length === 0) return
    const raw = msgListState.messageList
    if (!Array.isArray(raw)) return
    const found: any = raw.find((m: any) => m?.ID === id || m?.msgID === id)
    if (found == null) return
    const newStatus: number = found.status ?? 0
    const oldStatus: number = (activeMsg as any).status ?? 0
    if (newStatus !== oldStatus) {
      setActiveMsg({ ...activeMsg, status: newStatus } as MessageInfo)
    }
  }, [msgListState.messageList, (activeMsg as any)?.msgID])
  const [actionPos, setActionPos] = useState<{
    touch: { pageX: number; pageY: number }
    bubble: { x: number; y: number; width: number; height: number }
  } | null>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [highlightMsgID, setHighlightMsgID] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasTriedLoadOlder, setHasTriedLoadOlder] = useState(false)
  const [isLoadingNewer, setIsLoadingNewer] = useState(false)
  const [hasTriedLoadNewer, setHasTriedLoadNewer] = useState(false)

  const listRef = useRef<FlatList<MessageItem>>(null)
  const lastMessageCountRef = useRef(messages.length)
  const lastLatestMsgIDRef = useRef<string>(
    messages.length > 0 ? messages[messages.length - 1].msgID : ''
  )
  const pendingNewMessageCountRef = useRef(0)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locatingTraceIdRef = useRef<number>(0)
  const listLayoutHeightRef = useRef<number>(0)
  const pendingScrollIdxRef = useRef<{ idx: number; animated: boolean } | null>(null)
  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialScrollHandledRef = useRef(false)
  const messageItemsRef = useRef<MessageItem[]>([])
  messageItemsRef.current = messageItems
  useEffect(() => {
    if (messages.length > 0) {
      finalizeTimerRef.current = setTimeout((): void => {
        if (!initialScrollHandledRef.current) {
          initialScrollHandledRef.current = true
          if (locateMessageProp && locateMessageProp.msgID) {
            scrollToMessage(locateMessageProp, false)
          } else {
            scrollToBottom(false)
          }
        }
      }, 800)

      return (): void => {
        if (finalizeTimerRef.current != null) {
          clearTimeout(finalizeTimerRef.current)
          finalizeTimerRef.current = null
        }
      }
    }
    return undefined
  }, [messages.length > 0])

  useEffect(() => {
    if (isLocatingRef.current) {
      lastMessageCountRef.current = messages.length
      lastLatestMsgIDRef.current = messages.length > 0 ? messages[messages.length - 1].msgID : ''
      return
    }
    const prev = lastMessageCountRef.current
    const prevLatestID = lastLatestMsgIDRef.current
    const currLatestID = messages.length > 0 ? messages[messages.length - 1].msgID : ''
    const isNewMessage = currLatestID.length > 0 && currLatestID !== prevLatestID
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && !lastMessage.isSelf) {
        (convListState as any).clearConversationUnreadCount(conversationID).catch(() => undefined)
      }
      if (showScrollToTop) {
        pendingNewMessageCountRef.current += messages.length - prev
      }
    }
    lastMessageCountRef.current = messages.length
    lastLatestMsgIDRef.current = currLatestID
  }, [messages.length, conversationID, convListState, showScrollToTop])

  useEffect(() => {
    if (locateMessageProp && locateMessageProp.msgID) {
      if (initialScrollHandledRef.current) {
        return
      }
      if (messageItemsRef.current.length === 0) {
        return
      }
      initialScrollHandledRef.current = true
      requestAnimationFrame((): void => {
        if (initialScrollHandledRef.current === false) {
          initialScrollHandledRef.current = true
        }
        scrollToMessage(locateMessageProp, false)
      })
    }
  }, [locateMessageProp])

  useEffect(() => {
    let mounted = true
    try {
      const sdk = require('tuikit-atomicx-react-native')
      const handler = (data: { msgID?: string; boxRef?: any } | null | undefined): void => {
        if (!mounted) return
        if (!data || !data.msgID) return
        if (!showScrollToTop) {
          setTimeout((): void => {
            scrollToBottom(true)
          }, 380)
        }
      }
      const sub = sdk.onAtomicXEvent?.('audioConvertStreamGrow', handler)
      return (): void => {
        mounted = false
        try {
          if (sub && typeof sub.remove === 'function') sub.remove()
        } catch {
        }
      }
    } catch {
      return undefined
    }
  }, [showScrollToTop])

  const handleLongPress = useCallback(
    (
      msg: MessageInfo,
      pos: {
        touch: { pageX: number; pageY: number }
        bubble: { x: number; y: number; width: number; height: number }
      }
    ) => {
      setActiveMsg(msg)
      setActionPos(pos)
      setActionsVisible(true)
    },
    []
  )

  const isLoadingNewerRef = useRef(false)
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = e.nativeEvent
      const atBottom = contentOffset.y <= SCROLL_TO_BOTTOM_THRESHOLD
      setShowScrollToTop(contentOffset.y > SCROLL_TO_BOTTOM_THRESHOLD)
      if (atBottom && pendingNewMessageCountRef.current > 0) {
        pendingNewMessageCountRef.current = 0
      }
      if (
        contentOffset.y < 50 &&
        !isLoadingNewerRef.current &&
        msgListState.hasNewerMessages
      ) {
        isLoadingNewerRef.current = true
        setIsLoadingNewer(true)
        setHasTriedLoadNewer(true)
        msgListState
          .loadNewerMessages()
          .then((): void => {
            isLoadingNewerRef.current = false
            setIsLoadingNewer(false)
          })
          .catch((err: any | null): void => {
            const errMsg: string = err != null ? `${err}` : ''
            if (errMsg.includes('No more newer message') || errMsg.includes('No more')) {
            } else {
              console.error(`[MessageList] loadNewerMessages failed: ${errMsg.length > 0 ? errMsg : 'null'}`)
            }
            isLoadingNewerRef.current = false
            setIsLoadingNewer(false)
          })
      }
    },
    [msgListState]
  )
  const onScrollBeginDrag = useCallback((): void => {
    onMessageListTap?.()
  }, [onMessageListTap])

  const scrollToBottom = useCallback(
    (animated = true) => {
      if (messageItems.length === 0) return
      requestAnimationFrame((): void => {
        listRef.current?.scrollToOffset({ offset: 0, animated })
        setShowScrollToTop(false)
        pendingNewMessageCountRef.current = 0
      })
    },
    [messageItems.length]
  )

  const scrollToMessage = useCallback(
    (message: MessageInfo, animated = true) => {
      const msgID = message?.msgID
      if (!msgID) return
      const myTraceId = ++locatingTraceIdRef.current

      const findIdx = (): number =>
        messageItemsRef.current.findIndex(
          (it) => it.type === 'message' && it.message.msgID === msgID
        )

      const doFlash = (targetIdx: number): void => {
        if (targetIdx === -1) return
        pendingScrollIdxRef.current = { idx: targetIdx, animated }
        listRef.current?.scrollToIndex({
          index: targetIdx,
          animated,
          viewPosition: 0.3,
          viewOffset: 0,
        })
        setHighlightMsgID(msgID)
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
        highlightTimerRef.current = setTimeout((): void => {
          setHighlightMsgID('')
          highlightTimerRef.current = null
        }, 3000)
        setLocating(false)
      }

      let idx = findIdx()

      if (idx === -1) {
        setLocating(true)
        msgListState
          .loadMessages({
            cursor: message as any,
            direction: MessageLoadDirection.BOTH,
            pageCount: 30,
          })
          .then((): void => {
            const delays = [50, 150, 300, 500, 1000]
            let attempt = 0
            const tryLocate = (): void => {
              if (locatingTraceIdRef.current !== myTraceId) {
                return
              }
              attempt++
              const newIdx = findIdx()
              if (newIdx !== -1) {
                doFlash(newIdx)
                return
              }
              if (attempt < delays.length) {
                setTimeout(tryLocate, delays[attempt])
              } else {
                setLocating(false)
              }
            }
            setTimeout(tryLocate, delays[0])
          })
          .catch((e: any | null): void => {
            console.error(
              `[MessageList] scrollToMessage loadMessages failed: ${e != null ? `${e}` : 'null'}`
            )
            setLocating(false)
          })
        return
      }

      doFlash(idx)
    },
    [msgListState, setLocating]
  )

  const onContentSizeChange = useCallback((): void => {
    if (initialScrollHandledRef.current) {
      return
    }
    if (messageItems.length === 0) {
      return
    }
    initialScrollHandledRef.current = true
    if (locateMessageProp && locateMessageProp.msgID) {
      scrollToMessage(locateMessageProp, false)
    } else {
      scrollToBottom(false)
    }
  }, [locateMessageProp, messageItems.length, scrollToMessage, scrollToBottom])

  const onEndReached = useCallback((): void => {
    if (isLocatingRef.current) return
    if (!msgListState.hasOlderMessages) return
    if (isLoadingMore) return  
    setIsLoadingMore(true)
    setHasTriedLoadOlder(true)
    msgListState
      .loadOlderMessages()
      .then((): void => {
        setIsLoadingMore(false)
      })
      .catch((e: any | null): void => {
        const errMsg: string = e != null ? `${e}` : ''
        if (errMsg.includes('No more older message') || errMsg.includes('No more')) {
        } else {
          console.error(`[MessageList] loadOlderMessages failed: ${errMsg.length > 0 ? errMsg : 'null'}`)
        }
        setIsLoadingMore(false)
      })
  }, [msgListState, isLoadingMore])

  const renderListFooter = useCallback((): any => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      )
    }
    if (
      hasTriedLoadOlder &&
      !msgListState.hasOlderMessages &&
      messages.length > 0
    ) {
      return (
        <View style={styles.noMoreHint}>
          <Text style={styles.noMoreHintText}>{t('message.noMoreHistory')}</Text>
        </View>
      )
    }
    return null
  }, [isLoadingMore, hasTriedLoadOlder, msgListState.hasOlderMessages, messages.length])

  const renderListHeader = useCallback((): any => {
    if (isLoadingNewer) {
      return (
        <View style={styles.loadingNewer}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      )
    }
    return null
  }, [isLoadingNewer, hasTriedLoadNewer, msgListState.hasNewerMessages, messages.length])

  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom,
      scrollToMessage,
    }),
    [scrollToBottom, scrollToMessage]
  )

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }): void => {
      const pending = pendingScrollIdxRef.current
      const animated: boolean = pending?.animated ?? true
      const offsets: number[] = [100, 300, 500, 1000, 2000]
      let attempt = 0
      const retry = (): void => {
        attempt++
        if (attempt <= offsets.length) {
          setTimeout((): void => {
            try {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated,
                viewPosition: 0.3,
                viewOffset: 0,
              })
              return
            } catch {
              retry()
            }
          }, offsets[attempt - 1])
          return
        }
        const viewH: number = listLayoutHeightRef.current > 0 ? listLayoutHeightRef.current : 100
        const offset = Math.max(0, info.index * info.averageItemLength - viewH * 0.3)
        try {
          listRef.current?.scrollToOffset({ offset, animated })
        } catch (e: any | null) {
          console.error(
            `[MessageList] onScrollToIndexFailed: scrollToOffset also failed after ${offsets.length} retries`,
            e
          )
        }
      }
      retry()
    },
    []
  )

  useEffect(() => {
    return (): void => {
      if (highlightTimerRef.current != null) {
        clearTimeout(highlightTimerRef.current)
      }
      if (finalizeTimerRef.current != null) {
        clearTimeout(finalizeTimerRef.current)
      }
      if (locatingTimerRef.current != null) {
        clearTimeout(locatingTimerRef.current)
      }
    }
  }, [])

  const renderItem: ListRenderItem<MessageItem> = useCallback(
    ({ item }) => {
      try {
        if (item.type === 'divider') {
          return <MessageTimeDivider timestamp={item.timestamp} />
        }
        if (!item.message) {
          console.warn('[MessageList] renderItem: item.message is null', { key: item.key })
          return null
        }
        return (
          <MessageRenderer
            message={item.message}
            showAvatar={item.showAvatar}
            showNickname={item.showNickname}
            highlight={item.message.msgID === highlightMsgID}
            conversationID={conversationID}
            messageActionList={messageActionList}
            customMessageRender={customMessageRender ?? undefined}
            onLongPress={(e) => handleLongPress(item.message, e)}
            onMessageListTap={onMessageListTap}
            onMessageTap={onMessageTap}
          />
        )
      } catch (err) {
        console.error('[MessageList] renderItem error', err, { item })
        return null
      }
    },
    [
      handleLongPress,
      highlightMsgID,
      conversationID,
      messageActionList,
      customMessageRender,
      onMessageListTap,
      onMessageTap,
    ]
  )

  const showEmpty = messages.length === 0

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messageItems}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          showEmpty ? styles.listContentEmpty : null,
        ]}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        onContentSizeChange={onContentSizeChange}
        onLayout={(e: NativeSyntheticEvent<{ layout: { width: number; height: number } }>) => {
          listLayoutHeightRef.current = e.nativeEvent.layout.height
        }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        onScrollToIndexFailed={onScrollToIndexFailed}
        ListEmptyComponent={showEmpty && Empty ? <Empty /> : null}
        initialNumToRender={30}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        disableIntervalMomentum
        inverted
        
        ListFooterComponent={renderListFooter}
        ListHeaderComponent={renderListHeader}
      />

      {showScrollToTop && !showEmpty && (
        <Pressable
          style={styles.scrollBtn}
          onPress={() => scrollToBottom(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={DOWN_ICON} style={styles.scrollBtnIcon} resizeMode="cover" />
          <Text style={styles.scrollBtnText}>
            {pendingNewMessageCountRef.current > 0
              ? t('message.newMessageWithCount', { count: pendingNewMessageCountRef.current })
              : t('message.backToLatest')}
          </Text>
        </Pressable>
      )}

      <MessageActions
        visible={actionsVisible}
        message={activeMsg}
        position={actionPos}
        bottomInset={bottomInset}
        onClose={() => setActionsVisible(false)}
      />

      {audioPlayer}
      {videoPlayer}
    </View>
  )
})

MessageList.displayName = 'MessageList'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  listContent: {
    paddingVertical: 0,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBtn: {
    position: 'absolute',
    bottom: rpxToPx(32),
    right: rpxToPx(32),
    paddingHorizontal: rpxToPx(20),
    paddingVertical: rpxToPx(20),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(6),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: rpxToPx(2) },
    shadowOpacity: 0.1,
    shadowRadius: rpxToPx(5),
    elevation: 3,
    flexDirection: 'row',
    gap: rpxToPx(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBtnIcon: {
    width: rpxToPx(24),
    height: rpxToPx(24),
    marginBottom: rpxToPx(4),
  },
  scrollBtnText: {
    fontSize: rpxToPx(20),
    color: '#147AFF',
  },
  loadingMore: {
    paddingVertical: rpxToPx(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  noMoreHint: {
    paddingVertical: rpxToPx(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  noMoreHintText: {
    fontSize: rpxToPx(22),
    color: '#999999',
  },
  loadingNewer: {
    paddingVertical: rpxToPx(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
})
