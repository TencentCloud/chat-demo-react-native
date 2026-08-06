import React, { useEffect, useState } from 'react'
import { Clipboard, DeviceEventEmitter, Dimensions, Image, Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { MessageStatus as SDKMessageStatus,
  MessageType as SDKMessageType,
  useMessageActionState } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../../utils/rpxToPx'
import { getAudioConvertVisibleMap } from '../../../utils/audioConvertVisibleMapStore'
import { useTranslation } from 'react-i18next'
import { type MessageInfo } from './MessageTypes'
import { iconAssets } from '../../../static/iconBase64'
import { showToast } from '../../../utils/toast'

const COPY_ICON = iconAssets['static/assets/message-list/msg_copy.png']
const DELETE_ICON = iconAssets['static/assets/message-list/msg_delete.png']
const RECALL_ICON = iconAssets['static/assets/message-list/msg_recall.png']
const VOICE_TO_TEXT_ICON = iconAssets['static/assets/message-list/msg_voice_to_text.png']

const ARROW_SIZE = rpxToPx(32)

export interface MessageActionsProps {
  visible: boolean
  message?: MessageInfo | null
  
  showBelow?: boolean
  position?: {
    touch: { pageX: number; pageY: number }
    bubble: { x: number; y: number; width: number; height: number }
  } | null
  bottomInset?: number
  onClose?: () => void
  onCopy?: (msg: MessageInfo) => void
  onRecall?: (msg: MessageInfo) => void
  onDelete?: (msg: MessageInfo) => void
  onForward?: (msg: MessageInfo) => void
  onReply?: (msg: MessageInfo) => void
  onMultiSelect?: (msg: MessageInfo) => void
  onVoiceToText?: (msg: MessageInfo) => void
}

export const MessageActions: React.FC<MessageActionsProps> = (props) => {
  const { t } = useTranslation()
  const { visible,
    message,
    showBelow = false,
    position,
    bottomInset,
    onClose,
    onCopy,
    onRecall,
    onDelete,
    onForward: _onForward,
    onReply: _onReply,
    onMultiSelect: _onMultiSelect,
    onVoiceToText } = props

  const messageActionState = useMessageActionState({ message: (message ?? {}) as any })

  const [measuredPanelW, setMeasuredPanelW] = useState<number>(0)

  
  const mType: number = message ? ((message as any).messageType ?? 0) : 0
  const status: number = message ? ((message as any).status ?? 0) : 0
  const isText = mType === SDKMessageType.TEXT
  const isAudio = mType === SDKMessageType.AUDIO
  const isSelf = message?.isSelf === true

  const isRevokedStatus: boolean = status === SDKMessageStatus.REVOKED
  const isDeletedStatus: boolean = status === SDKMessageStatus.DELETED
  const canRecall = ((): boolean => {
    if (!isSelf) return false
    if (isRevokedStatus || isDeletedStatus) {
      return false
    }
    if (message?.timestamp) {
      const now = Math.floor(Date.now() / 1000)
      const timeDiff = now - message.timestamp
      return timeDiff <= 120
    }
    return false
  })()

  const hasAsrText: boolean = !!(message?.messagePayload as any)?.asrText
  useEffect(() => {
    if (!visible) return
    if (isRevokedStatus || isDeletedStatus) {
      onClose?.()
    }
  }, [visible, isRevokedStatus, isDeletedStatus, onClose])
  const visibleMap: Map<string, boolean> = getAudioConvertVisibleMap()
  const msgIDForVisibleMap: string = message?.msgID ?? ''
  const isVisibleInMap: boolean | null = visibleMap.has(msgIDForVisibleMap)
    ? visibleMap.get(msgIDForVisibleMap) === true
    : null
  const voiceTextVisible: boolean = hasAsrText
    ? (isVisibleInMap !== null ? isVisibleInMap : true)
    : false
  const voiceActionLabel: string = voiceTextVisible
    ? t('message.voiceToTextHide')
    : t('message.voiceToText')

  const GAP = rpxToPx(16)
  const ARROW = ARROW_SIZE 
  const itemH = rpxToPx(72)
  const PANEL_BODY_H = itemH + rpxToPx(33) + rpxToPx(22) 
  const screenW = Dimensions.get('window').width
  const screenH = Dimensions.get('window').height
  const SAFE_TOP = 48
  const SAFE_BOTTOM = 34
  const effectiveBottomInset: number = Math.max(SAFE_BOTTOM, (bottomInset ?? 0) + 8)

  const itemMinW = rpxToPx(114)
  const itemMargin = rpxToPx(16)
  const visibleItemCount = (isText ? 1 : 0) + (canRecall ? 1 : 0) + (isAudio ? 1 : 0) + 1
  const itemOuterW = itemMinW + itemMargin * 2
  const FALLBACK_PANEL_W = visibleItemCount * itemOuterW
  const PANEL_W = measuredPanelW > 0 ? measuredPanelW : FALLBACK_PANEL_W

  const panelLayout = ((): {
    top: number
    left: number
    arrowLeft: number
    showBelow: boolean
    centerFallback: boolean
  } => {
    if (!position) {
      return {
        top: (screenH - PANEL_BODY_H) / 2,
        left: 16,
        arrowLeft: PANEL_W / 2,
        showBelow: false,
        centerFallback: true,
      }
    }
    const { bubble, touch } = position
    const bubbleHasSize = bubble.width > 0 && bubble.height > 0
    const bubbleCenterX = bubbleHasSize
      ? bubble.x + bubble.width / 2
      : touch.pageX
    const bubbleTopY = bubbleHasSize ? bubble.y : touch.pageY
    const bubbleBottomY = bubbleHasSize
      ? bubble.y + bubble.height
      : touch.pageY

    const topBelow = bubbleBottomY + GAP
    const topAbove = bubbleTopY - PANEL_BODY_H - GAP

    const inSafeArea = (t: number): boolean =>
      t >= SAFE_TOP && t + PANEL_BODY_H <= screenH - effectiveBottomInset
    const canShowBelow = inSafeArea(topBelow)
    const canShowAbove = inSafeArea(topAbove)

    let finalTop: number
    let finalShowBelow: boolean
    let centerFallback = false
    if (canShowBelow && canShowAbove) {
      finalShowBelow = showBelow || bubbleTopY < PANEL_BODY_H + GAP + 40
      finalTop = finalShowBelow ? topBelow : topAbove
    } else if (canShowBelow) {
      finalShowBelow = true
      finalTop = topBelow
    } else if (canShowAbove) {
      finalShowBelow = false
      finalTop = topAbove
    } else {
      finalShowBelow = false
      finalTop = (screenH - PANEL_BODY_H) / 2
      centerFallback = true
    }
    finalTop = Math.max(SAFE_TOP, Math.min(finalTop, screenH - PANEL_BODY_H - effectiveBottomInset))

    let idealLeft: number
    if (centerFallback) {
      idealLeft = (screenW - PANEL_W) / 2
    } else if (isSelf) {
      idealLeft = bubble.x + bubble.width - PANEL_W
    } else {
      idealLeft = bubble.x
    }
    const left = Math.max(16, Math.min(idealLeft, screenW - PANEL_W - 16))
    const arrowLeft = centerFallback
      ? PANEL_W / 2
      : Math.max(ARROW, Math.min(bubbleCenterX - left, PANEL_W - ARROW))
    return { top: finalTop, left, arrowLeft, showBelow: finalShowBelow, centerFallback }
  })()

  if (!message) {
    return null
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.mask}
        onPress={onClose}
      >
        {position ? (
          <Pressable
            style={[
              styles.panelWrapper,
              { top: panelLayout.top, left: panelLayout.left },
            ]}
            onPress={(): void => {
            }}
          >
            <View
              style={styles.panel}
              onLayout={(e): void => {
                const w: number = e.nativeEvent.layout.width
                if (w > 0 && Math.abs(w - measuredPanelW) > 0.5) {
                  setMeasuredPanelW(w)
                }
              }}
            >
              {!panelLayout.centerFallback && (
                <View
                  style={ [
                    panelLayout.showBelow ? styles.arrowUp : styles.arrowDown,
                    {
                      left: panelLayout.arrowLeft - ARROW_SIZE / 2,
                      top: panelLayout.showBelow
                        ? -ARROW_SIZE / 2
                        : PANEL_BODY_H - 1 },
                  ]}
                />
              )}
              {isText && (
                <ActionItem
                  icon={COPY_ICON}
                  label={t('message.copy')}
                  onPress={(): void => {
                    if (onCopy) {
                      onCopy(message)
                    } else {
                      const text: string =
                        (message as any).messagePayload?.text ?? ''
                      if (text.length > 0) {
                        try {
                          Clipboard.setString(text)
                          showToast(t('message.copySuccess'))
                        } catch {
                          showToast(t('message.copyFailed'))
                        }
                      }
                    }
                    onClose?.()
                  }}
                />
              )}
              {canRecall && (
                <ActionItem
                  icon={RECALL_ICON}
                  label={t('message.recall')}
                  onPress={(): void => {
                    if (onRecall) {
                      onRecall(message)
                      onClose?.()
                    } else {
                      messageActionState
                        .revoke()
                        .then((): void => {
                          onClose?.()
                        })
                        .catch((e: any | null): void => {
                          console.warn(
                            `[MessageActions] revoke failed: ${e != null ? `${e}` : 'null'}`
                          )
                          showToast(t('message.recallFailed'))
                          onClose?.()
                        })
                    }
                  }}
                />
              )}
              {isAudio && (
                <ActionItem
                  icon={VOICE_TO_TEXT_ICON}
                  label={voiceActionLabel}
                  onPress={(): void => {
                    if (onVoiceToText) {
                      onVoiceToText(message)
                      onClose?.()
                    } else { onClose?.()
                      if (voiceTextVisible) {
                        DeviceEventEmitter.emit('audioConvertHide', {
                          messageId: message?.msgID ?? '' })
                        return
                      }
                      DeviceEventEmitter.emit('audioConvertingStart', { messageId: message?.msgID ?? '' })
                      messageActionState
                        .convertVoiceToText('zh')
                        .catch((e: any | null): void => {
                          console.warn(
                            `[MessageActions] convertVoiceToText failed: ${e != null ? `${e}` : 'null'}`
                          )
                          DeviceEventEmitter.emit('audioConvertingError', { messageId: message?.msgID ?? '' })
                          const errMsg: string = e != null && typeof e === 'object' && 'message' in e
                                ? `${(e as { message?: string }).message ?? t('message.audioConvertFailed')}`
                                : t('message.audioConvertFailed')
                          showToast(errMsg)
                        })
                    }
                  }}
                />
              )}
              <ActionItem
                icon={DELETE_ICON}
                label={t('message.delete')}
                onPress={(): void => {
                  if (onDelete) {
                    onDelete(message)
                    onClose?.()
                  } else {
                    messageActionState
                      .delete()
                      .then((): void => {
                        onClose?.()
                      })
                      .catch((e: any | null): void => {
                        console.warn(
                          `[MessageActions] delete failed: ${e != null ? `${e}` : 'null'}`
                        )
                        showToast(t('message.deleteFailed'))
                        onClose?.()
                      })
                  }
                }}
              />
            </View>
          </Pressable>
        ) : (
          <View style={styles.centering}>
            {!panelLayout.centerFallback && (
              <View
                style={ [
                  showBelow ? styles.arrowDown : styles.arrowUp,
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0 },
                ]}
              />
            )}
            <View style={styles.panel}>
              {isText && (
                <ActionItem
                  icon={COPY_ICON}
                  label={t('message.copy')}
                  onPress={(): void => {
                    if (onCopy) {
                      onCopy(message)
                    } else {
                      const text: string =
                        (message as any).messagePayload?.text ?? ''
                      if (text.length > 0) {
                        try {
                          Clipboard.setString(text)
                          showToast(t('message.copySuccess'))
                        } catch {
                          showToast(t('message.copyFailed'))
                        }
                      }
                    }
                    onClose?.()
                  }}
                />
              )}
              {canRecall && (
                <ActionItem
                  icon={RECALL_ICON}
                  label={t('message.recall')}
                  onPress={(): void => {
                    if (onRecall) {
                      onRecall(message)
                      onClose?.()
                    } else {
                      messageActionState
                        .revoke()
                        .then((): void => {
                          onClose?.()
                        })
                        .catch((e: any | null): void => {
                          console.warn(
                            `[MessageActions] revoke failed: ${e != null ? `${e}` : 'null'}`
                          )
                          showToast(t('message.recallFailed'))
                          onClose?.()
                        })
                    }
                  }}
                />
              )}
              {isAudio && (
                <ActionItem
                  icon={VOICE_TO_TEXT_ICON}
                  label={voiceActionLabel}
                  onPress={(): void => {
                    if (onVoiceToText) {
                      onVoiceToText(message)
                      onClose?.()
                    } else { onClose?.()
                      if (voiceTextVisible) {
                        DeviceEventEmitter.emit('audioConvertHide', {
                          messageId: message?.msgID ?? '' })
                        return
                      }
                      DeviceEventEmitter.emit('audioConvertingStart', { messageId: message?.msgID ?? '' })
                      messageActionState
                        .convertVoiceToText('zh')
                        .catch((e: any | null): void => {
                          console.warn(
                            `[MessageActions] convertVoiceToText failed: ${e != null ? `${e}` : 'null'}`
                          )
                          DeviceEventEmitter.emit('audioConvertingError', { messageId: message?.msgID ?? '' })
                          const errMsg: string = e != null && typeof e === 'object' && 'message' in e
                                ? `${(e as { message?: string }).message ?? t('message.audioConvertFailed')}`
                                : t('message.audioConvertFailed')
                          showToast(errMsg)
                        })
                    }
                  }}
                />
              )}
              <ActionItem
                icon={DELETE_ICON}
                label={t('message.delete')}
                onPress={(): void => {
                  if (onDelete) {
                    onDelete(message)
                    onClose?.()
                  } else {
                    messageActionState
                      .delete()
                      .then((): void => {
                        onClose?.()
                      })
                      .catch((e: any | null): void => {
                        console.warn(
                          `[MessageActions] delete failed: ${e != null ? `${e}` : 'null'}`
                        )
                        showToast(t('message.deleteFailed'))
                        onClose?.()
                      })
                  }
                }}
              />
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  )
}

const ActionItem: React.FC<{
  icon: any
  label: string
  disabled?: boolean
  onPress?: () => void
}> = ({ icon, label, disabled, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }): any => [
      styles.item,
      pressed && !disabled ? styles.itemPressed : null,
    ]}
  >
    <Image
      source={icon}
      style={[styles.itemIcon, disabled && { opacity: 0.3 }]}
      resizeMode="contain"
    />
    <Text style={[styles.itemText, disabled && { color: 'rgba(0,0,0,0.3)' }]}>{label}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)' },
  panelWrapper: { position: 'absolute' },
  centering: { flex: 1,
    alignItems: 'center',
    justifyContent: 'center' },
  arrowUp: { width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderBottomWidth: ARROW_SIZE / 2,
    borderTopWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 1 },
  arrowDown: { width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderTopWidth: ARROW_SIZE / 2,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 1 },
  panel: {
    flexDirection: 'row',
    gap: rpxToPx(80),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(14),
    paddingTop: rpxToPx(33),
    paddingBottom: rpxToPx(22),
    paddingHorizontal: rpxToPx(40),
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: rpxToPx(8) },
    shadowOpacity: 0.25,
    shadowRadius: rpxToPx(12),
    elevation: 8,
  },
  item: { flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', },
  itemPressed: { opacity: 0.6 },
  itemIcon: { width: rpxToPx(36),
    height: rpxToPx(36),
    marginBottom: rpxToPx(10) },
  itemText: { fontSize: rpxToPx(20),
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center' },
})
