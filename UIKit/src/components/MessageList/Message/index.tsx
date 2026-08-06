import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import {
  MessageStatus as SDKMessageStatus,
  MessageType as SDKMessageType,
} from 'tuikit-atomicx-react-native'
import { type MessageInfo } from './MessageTypes'
import { Avatar } from '../../Avatar/Avatar'
import { iconAssets } from '../../../static/iconBase64'
import { TextMessage } from './TextMessage/TextMessage'
import { ImageMessage } from './ImageMessage/ImageMessage'
import { AudioMessage } from './AudioMessage/AudioMessage'
import { VideoMessage } from './VideoMessage/VideoMessage'
import { FileMessage } from './FileMessage/FileMessage'
import { CustomMessage } from './CustomMessage/CustomMessage'
import { MergerMessage } from './MergerMessage/MergerMessage'
import { GroupTipMessage } from './GroupTipMessage/GroupTipMessage'
import { RecalledMessage } from './RecalledMessage/RecalledMessage'
import { FaceMessage } from './FaceMessage/FaceMessage'
import { rpxToPx } from '../../../utils/rpxToPx'
import { useTranslation } from 'react-i18next'

const LONG_PRESS_THRESHOLD_MS = 350
const isGroupCreateMessage = (m: MessageInfo): boolean => {
  const payload = m.messagePayload
  if (!payload) return false
  const cd: any = (payload as any).customData
  if (!cd) return false
  try {
    const data = typeof cd === 'string' ? JSON.parse(cd) : cd
    return data?.businessID === 'group_create'
  } catch {
    return false
  }
}

const formatTime = (ts: number): string => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  if (sameDay) return `${hh}:${mm}`
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`
}

export interface MessageRendererProps {
  message: MessageInfo
  conversationID?: string
  showAvatar?: boolean
  showNickname?: boolean
  showTime?: boolean
  messageActionList?: string[]
  highlight?: boolean
  customCenterChecker?: ((message: MessageInfo, conversationID: string) => boolean) | null
  customMessageRender?: ((message: MessageInfo, conversationID: string) => React.ReactNode) | null
  onImageClick?: (imagePath: string, msgID: string) => void
  onPlayAudio?: (audioPath: string, msgID: string) => void
  onVoiceToText?: (audioPath: string, msgID: string) => void
  onPlayVideo?: (videoPath: string, msgID: string) => void
  onFileClick?: (filePath: string, fileName: string) => void
  onCustomClick?: (data: string, msgID: string) => void
  onLocationClick?: (lat: number, lng: number, desc?: string) => void
  onMergerClick?: (msgID: string) => void
  onAvatarClick?: (userID: string) => void
  onLongPress?: (position: {
    touch: { pageX: number; pageY: number }
    bubble: { x: number; y: number; width: number; height: number }
  }) => void
  onMessageListTap?: () => void
  onMessageTap?: (msg: MessageInfo) => void
  onResend?: (msg: MessageInfo) => void
}

const renderMessageContent = (
  message: MessageInfo,
  props: MessageRendererProps
): React.ReactNode => {
  const mt: number = (message as any).messageType
  const conversationID: string = props.conversationID ?? ''
  switch (mt) {
    case SDKMessageType.TEXT:
      return <TextMessage message={message} />
    case SDKMessageType.IMAGE:
      return (
        <ImageMessage
          message={message}
          onImageClick={(p) => props.onImageClick?.(p, message.msgID)}
        />
      )
    case SDKMessageType.AUDIO:
      return (
        <AudioMessage
          message={message}
          onLongPress={props.onLongPress}
          onPlayAudio={props.onPlayAudio}
          onVoiceToText={props.onVoiceToText}
        />
      )
    case SDKMessageType.VIDEO:
      return (
        <VideoMessage
          message={message}
          onPlayVideo={props.onPlayVideo}
        />
      )
    case SDKMessageType.FILE:
      return (
        <FileMessage message={message} />
      )
    case SDKMessageType.CUSTOM:
      return (
        <CustomMessage
          message={message}
          conversationID={conversationID}
          onCustomClick={(d) => props.onCustomClick?.(d, message.msgID)}
        />
      )
    case SDKMessageType.MERGED:
      return (
        <MergerMessage
          message={message}
          onMergerClick={(id) => props.onMergerClick?.(id)}
        />
      )
    case SDKMessageType.FACE:
      return <FaceMessage message={message} />
    case SDKMessageType.TIPS:
      return <GroupTipMessage message={message} />
    case SDKMessageType.STREAM:
      return <GroupTipMessage message={message} />
    default:
      return <TextMessage message={message} />
  }
}

const HIGHLIGHT_FLASH_COUNT = 3
const HIGHLIGHT_FLASH_MS = 200
const HIGHLIGHT_COLOR = '#FFD54F'

const useHighlightAnimation = (highlight?: boolean): Animated.Value => {
  const opacity = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (animationRef.current != null) {
      animationRef.current.stop()
      animationRef.current = null
    }
    opacity.stopAnimation()
    opacity.setValue(0)

    if (!highlight) {
      return undefined
    }

    const sequence: Animated.CompositeAnimation[] = []
    for (let i = 0; i < HIGHLIGHT_FLASH_COUNT; i++) {
      sequence.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration: HIGHLIGHT_FLASH_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: HIGHLIGHT_FLASH_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      )
    }
    const loop = Animated.sequence(sequence)
    animationRef.current = loop
    loop.start()

    return (): void => {
      if (animationRef.current != null) {
        animationRef.current.stop()
        animationRef.current = null
      }
      opacity.stopAnimation()
      opacity.setValue(0)
    }
  }, [highlight, opacity])
  return opacity
}

const useLoadingRotation = (active: boolean): Animated.AnimatedInterpolation<string> | string => {
  const rotation = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!active) {
      rotation.setValue(0)
      return undefined
    }
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    loop.start()
    return (): void => {
      loop.stop()
    }
  }, [active, rotation])
  return rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
}

export const MessageRenderer: React.FC<MessageRendererProps> = (props) => {
  const { t } = useTranslation()
  const {
    message,
    customCenterChecker,
    customMessageRender,
    conversationID = '',
    onMessageListTap,
  } = props

  const isCenterMessage = useMemo((): boolean => {
    const status = (message as any).status
    if (status === SDKMessageStatus.REVOKED || (message as any).isRecalled === true) {
      return true
    }
    const mt: number = (message as any).messageType
    if (mt === SDKMessageType.TIPS) {
      return true
    }
    if (isGroupCreateMessage(message)) {
      return true
    }
    if (customCenterChecker && customCenterChecker(message, conversationID)) {
      return true
    }
    return false
  }, [message, customCenterChecker, conversationID])

  const customNode = useMemo((): React.ReactNode | null => {
    if (!customMessageRender) return null
    try {
      const r = customMessageRender(message, conversationID)
      return r == null ? null : r
    } catch (e) {
      console.error(`[Message] customMessageRender failed: ${e}`)
      return null
    }
  }, [customMessageRender, message, conversationID])

  if (isCenterMessage) {
    const mt: number = (message as any).messageType
    const isRecalled =
      (message as any).isRecalled === true || (message as any).status === SDKMessageStatus.REVOKED
    const isTip = mt === SDKMessageType.TIPS || isGroupCreateMessage(message)
    return (
      <Pressable
        style={styles.centerContainer}
        onPress={onMessageListTap}
      >
        {customNode ? (
          <View>{customNode}</View>
        ) : isRecalled ? (
          <RecalledMessage message={message} conversationID={conversationID} />
        ) : isTip ? (
          <GroupTipMessage message={message} />
        ) : (
          <CustomMessage
            message={message}
            conversationID={conversationID}
            onCustomClick={(d) => props.onCustomClick?.(d, message.msgID)}
          />
        )}
      </Pressable>
    )
  }

  return <MessageItemContent {...props} customNode={customNode} />
}

const MessageItemContent: React.FC<MessageRendererProps & { customNode: React.ReactNode | null }> = (
  props
) => {
  const { t } = useTranslation()
  const {
    message,
    showAvatar = true,
    showNickname = true,
    showTime = false,
    highlight = false,
    onAvatarClick,
    onLongPress,
    onMessageListTap,
    onMessageTap,
    onResend,
    customNode,
  } = props

  const isSelf = message.isSelf === true
  const status = (message as any).status
  const needReadReceipt = (message as any).needReadReceipt === true
  const messageID: string = message.msgID

  const bubbleRef = useRef<View>(null)
  void messageID

  const sender: any = (message as any).sender ?? (message as any).from
  const displayName: string =
    sender?.nameCard ||
    sender?.friendRemark ||
    sender?.nickname ||
    sender?.userID ||
    ''

  const showStatus =
    isSelf &&
    (status === SDKMessageStatus.SENDING || status === SDKMessageStatus.SEND_FAIL)
  const showReadStatus =
    isSelf && status === SDKMessageStatus.SEND_SUCCESS && needReadReceipt

  const receipt = (message as any).receipt
  let readStatusText: string = (t as any)('message.unread')
  if (receipt) {
    const readCount: number = receipt.readCount ?? 0
    const unreadCount: number = receipt.unreadCount ?? 0
    if (unreadCount === 0) {
      readStatusText = (t as any)('message.read')
    } else {
      readStatusText = (t as any)('message.readCount', { count: readCount })
    }
  }

  const highlightOpacity = useHighlightAnimation(highlight)
  const loadingRotation = useLoadingRotation(status === SDKMessageStatus.SENDING)

  const handleLongPress = (e: any): void => {
    const touch = e?.nativeEvent
      ? { pageX: (e.nativeEvent as any).pageX, pageY: (e.nativeEvent as any).pageY }
      : { pageX: 0, pageY: 0 }
    const node: any = bubbleRef.current
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x: number, y: number, width: number, height: number) => {
        const bubble =
          width > 0 && height > 0
            ? { x, y, width, height }
            : { x: touch.pageX, y: touch.pageY, width: 0, height: 0 }
        onLongPress?.({ touch, bubble })
      })
    } else {
      onLongPress?.({
        touch,
        bubble: { x: touch.pageX, y: touch.pageY, width: 0, height: 0 },
      })
    }
  }
  const handleMessageContentTap = (): void => {
    onMessageListTap?.()
    onMessageTap?.(message)
  }

  const content = customNode != null
    ? customNode
    : renderMessageContent(message, props)

  const avatarSize = rpxToPx(80)
  const avatarNode = showAvatar ? (
    <Pressable
      onPress={() => sender && onAvatarClick?.(sender.userID)}
      style={isSelf ? styles.avatarWrapOut : styles.avatarWrap}
    >
      <Avatar src={sender?.avatarURL} name={displayName} size={80} defaultAvatarType="user" />
    </Pressable>
  ) : (
    <View style={[styles.avatarPlaceholder, { width: avatarSize, marginRight: isSelf ? 0 : rpxToPx(24) }]} />
  )

  return (
    <Pressable
      style={styles.msgContainer}
      onPress={onMessageListTap}
      {...({ selectable: false } as any)}
    >
      <View style={[styles.row, isSelf ? styles.rowOut : styles.rowIn]}>
        {avatarNode}
        <View style={[styles.main, isSelf ? styles.mainOut : styles.mainIn]}>
          {showNickname && (
            <Text style={styles.nickname} numberOfLines={1}>
              {displayName}
            </Text>
          )}
          <View style={[styles.bubbleContainer, isSelf ? styles.bubbleContainerOut : styles.bubbleContainerIn]}>
            <Pressable
              ref={bubbleRef}
              onLongPress={handleLongPress}
              onPress={handleMessageContentTap}
              delayLongPress={LONG_PRESS_THRESHOLD_MS}
              style={({ pressed }): any => [
                styles.bubble,
                isSelf ? styles.bubbleOut : styles.bubbleIn,
                pressed ? styles.bubblePressed : null,
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.highlightOverlay,
                  isSelf ? styles.highlightOverlayOut : styles.highlightOverlayIn,
                  { opacity: highlightOpacity, backgroundColor: HIGHLIGHT_COLOR },
                ]}
              />
              {content}
            </Pressable>
            {showStatus && (
              <View style={[styles.statusContainer, isSelf ? styles.statusOut : styles.statusIn]}>
                {status === SDKMessageStatus.SENDING ? (
                  <Animated.View style={{ transform: [{ rotate: loadingRotation }] }}>
                    <Image
                      source={iconAssets['static/icon/loading.png']}
                      style={styles.statusIcon}
                      resizeMode="cover"
                    />
                  </Animated.View>
                ) : (
                  <Pressable
                    onPress={() => onResend?.(message)}
                    style={styles.statusIconWrap}
                  >
                    <Image
                      source={iconAssets['static/icon/error.png']}
                      style={styles.statusIcon}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}
              </View>
            )}
            {showReadStatus && (
              <View style={[styles.readStatus, isSelf ? styles.readStatusOut : styles.readStatusIn]}>
                <Text style={styles.readText}>{readStatusText}</Text>
              </View>
            )}
          </View>
          {showTime && (
            <View style={[styles.time, isSelf ? styles.timeOut : null]}>
              <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

export { MessageType } from './MessageTypes'
export type { MessageInfo, MessagePayload, MessageSenderInfo } from './MessageTypes'

const styles = StyleSheet.create({
  centerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rpxToPx(20),
    paddingHorizontal: 0,
    width: '100%',
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  highlightOverlayIn: {
    borderTopLeftRadius: rpxToPx(4),
    borderTopRightRadius: rpxToPx(20),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  highlightOverlayOut: {
    borderTopLeftRadius: rpxToPx(20),
    borderTopRightRadius: rpxToPx(4),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  msgContainer: {
    flexDirection: 'row',
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(22),
    alignItems: 'flex-start',
  },
  avatarWrap: {
    marginRight: rpxToPx(24),
  },
  avatarWrapOut: {
    marginLeft: rpxToPx(24),
  },
  avatarPlaceholder: {
    height: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  rowIn: {
    flexDirection: 'row',
  },
  rowOut: {
    flexDirection: 'row-reverse',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  mainOut: {
    paddingTop: rpxToPx(10),
    alignItems: 'flex-end',
  },
  mainIn: {
    paddingTop: rpxToPx(10),
  },
  nickname: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0,0,0,0.4)',
    marginBottom: rpxToPx(8),
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubbleContainerIn: {
    flexDirection: 'row',
  },
  bubbleContainerOut: {
    flexDirection: 'row-reverse',
  },
  bubble: {
  },
  bubbleIn: {},
  bubbleOut: {},
  bubblePressed: {
    opacity: 0.9,
  },
  statusContainer: {
    height: rpxToPx(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIn: {
    marginLeft: rpxToPx(16),
  },
  statusOut: {
    marginRight: rpxToPx(16),
  },
  statusIconWrap: {
    padding: 2,
  },
  statusIcon: {
    width: rpxToPx(32),
    height: rpxToPx(32),
  },
  readStatus: {
    marginLeft: rpxToPx(16),
  },
  readStatusIn: {},
  readStatusOut: {
    marginLeft: 0,
    marginRight: rpxToPx(16),
  },
  readText: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0,0,0,0.4)',
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: rpxToPx(8),
  },
  timeOut: {
    flexDirection: 'row-reverse',
  },
  timeText: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0,0,0,0.4)',
  },
})
