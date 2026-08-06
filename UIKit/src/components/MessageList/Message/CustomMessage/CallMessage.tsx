import React, { useMemo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { iconAssets } from '../../../../static/iconBase64'
import {
  parseCallMessageData,
  isVideoCall,
  getCallMessageText,
} from '../../../../utils/callMessageUtils'

const VOICE_ICON = iconAssets['components/MessageList/Message/assets/voice-icon.png']
const VIDEO_ICON = iconAssets['components/MessageList/Message/assets/video-icon.png']

export interface CallMessageProps {
  message: MessageInfo
  isGroupCall?: boolean
}

export const CallMessage: React.FC<CallMessageProps> = ({ message, isGroupCall = false }) => {
  const { t } = useTranslation()
  const callData = useMemo(() => parseCallMessageData(message), [message])
  const isVideo = useMemo(() => isVideoCall(callData), [callData])
  const callText = useMemo(() => getCallMessageText(message, true, t), [message, t])

  if (isGroupCall) {
    return (
      <View style={styles.groupCallContainer}>
        <Text style={styles.groupCallText}>{callText}</Text>
      </View>
    )
  }

  const isSelf = message.isSelf === true
  const iconSource = isVideo ? VIDEO_ICON : VOICE_ICON
  return (
    <View
      style={[
        styles.callContainer,
        isSelf ? styles.callContainerOut : styles.callContainerIn,
      ]}
    >
      <Text style={styles.callText}>{callText}</Text>
      <Image
        source={iconSource}
        style={[
          styles.callIcon,
          isVideo ? styles.callIconVideo : styles.callIconVoice,
          isSelf ? styles.callIconOut : styles.callIconIn,
          isVideo && !isSelf ? styles.callIconVideoIn : null,
        ]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  groupCallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCallText: {
    fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(34),
    color: 'rgba(0, 0, 0, 0.4)',
  },
  callContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rpxToPx(12),
    paddingHorizontal: rpxToPx(24),
    paddingVertical: rpxToPx(20),
    minWidth: rpxToPx(160),
  },
  callContainerIn: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F0F2F7',
    borderTopLeftRadius: rpxToPx(4),
    borderTopRightRadius: rpxToPx(20),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  callContainerOut: {
    backgroundColor: '#CCE2FF',
    borderTopLeftRadius: rpxToPx(20),
    borderTopRightRadius: rpxToPx(4),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  callText: {
    fontSize: rpxToPx(24),
    fontWeight: '400',
    lineHeight: rpxToPx(34),
    color: 'rgba(0, 0, 0, 0.9)',
  },
  callIcon: {
    width: rpxToPx(32),
  },
  callIconVideo: {
    height: rpxToPx(22),
  },
  callIconVoice: {
    height: rpxToPx(12),
  },
  callIconOut: {
    marginLeft: rpxToPx(10),
  },
  callIconIn: {
    marginRight: rpxToPx(10),
  },
  callIconVideoIn: {
    transform: [{ rotate: '180deg' }],
  },
})
