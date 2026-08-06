import React, { useCallback } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native'
import { Text } from '../Text'
import { launchImageLibrary, type Asset } from 'react-native-image-picker'
import { pick, isErrorWithCode, errorCodes, types as docTypes } from '@react-native-documents/picker'
import { createThumbnail } from 'react-native-create-thumbnail'
import { useMessageInputState, type OfflinePushInfoResolver } from 'tuikit-atomicx-react-native'
import { sendMediaMessage } from './sendMediaMessage'
import { rpxToPx } from '../../utils/rpxToPx'
import { useTranslation } from 'react-i18next'
import { theme } from '../../utils/theme'

export interface ToolItem {
  id: string
  name: string
  icon: ImageSourcePropType
  callback?: (tool: ToolItem) => void
}

import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'

const ICON_IMAGE = iconAssets['static/icon/message-input/nvue_image.png']
const ICON_CAMERA = iconAssets['static/icon/message-input/nvue_camera.png']
const ICON_FILE = iconAssets['static/icon/message-input/file.png']

export const DEFAULT_TOOLS: ToolItem[] = [
  { id: 'image', name: '__I18N__:messageInput.toolImage', icon: ICON_IMAGE },
  // { id: 'video', name: '__I18N__:messageInput.toolVideo', icon: ICON_CAMERA },
  { id: 'file', name: '__I18N__:messageInput.toolFile', icon: ICON_FILE },
  // { id: 'voiceCall', name: '语音通话', icon: ICON_VOICE },
  // { id: 'videoCall', name: '视频通话', icon: ICON_VIDEO },
]

export const resolveToolName = (name: string, t: (key: string) => string): string => {
  if (name.startsWith('__I18N__:')) {
    return t(name.slice('__I18N__:'.length))
  }
  return name
}

const COLUMNS = 4
const TOOL_ICON_SIZE = rpxToPx(128)
const TOOL_ICON_INNER_SIZE = rpxToPx(52)

export interface ToolsPanelProps {
  toolList?: ToolItem[]
  conversationID?: string
  setOfflinePushInfo?: OfflinePushInfoResolver
}

export const ToolsPanel: React.FC<ToolsPanelProps> = (props) => {
  const { t } = useTranslation()
  const { toolList = DEFAULT_TOOLS, conversationID, setOfflinePushInfo } = props

  const displayList = toolList && toolList.length > 0 ? toolList : DEFAULT_TOOLS

  const messageInputState = useMessageInputState({ conversationID: conversationID ?? '' })

  const handleImagePick = useCallback(async (): Promise<void> => { try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 1,
        quality: 0.9 })
      if (result.didCancel) return
      if (result.errorCode != null) {
        const errMsg: string = `${result.errorMessage ?? result.errorCode}`
        showToast(`${errMsg}`)
        return
      }
      const asset: Asset | undefined = result.assets?.[0]
      if (asset == null || asset.uri == null) return
      const imagePath = asset.uri.startsWith('file://') ? asset.uri.slice(7) : asset.uri
      await sendMediaMessage({ messageInputState,
        conversationID: conversationID ?? '',
        payload: {
          type: 'image',
          imagePath,
          imageWidth: asset.width,
          imageHeight: asset.height },
        setOfflinePushInfo,
      })
    } catch (e: any) {
      console.error('[ToolsPanel] image pick failed:', e)
      const errMsg: string = e != null ? `${e}` : t('messageInput.unknownError')
      showToast(`${errMsg}`)
    }
  }, [messageInputState, conversationID, setOfflinePushInfo])

  const handleVideoPick = useCallback(async (): Promise<void> => { try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1 })
      if (result.didCancel) return
      if (result.errorCode != null) {
        const errMsg: string = `${result.errorMessage ?? result.errorCode}`
        showToast(`${errMsg}`)
        return
      }
      const asset: Asset | undefined = result.assets?.[0]
      if (asset == null || asset.uri == null) return
      const videoFilePath = asset.uri.startsWith('file://') ? asset.uri.slice(7) : asset.uri
      
      const durationSec = asset.duration != null ? Math.round(asset.duration) : 0
      
      const videoType = asset.type?.startsWith('video/') ? asset.type.slice(6) : 'mp4'
      const snapshotTimeMs = durationSec >= 2 ? Math.floor(durationSec * 1000 / 2) : 0
      let snapshotPath: string
      try { const thumb = await createThumbnail({
          url: asset.uri,
          timeStamp: snapshotTimeMs,
          format: 'jpeg' })
        snapshotPath = thumb.path
      } catch (thumbErr: any) {
        
        console.error('[ToolsPanel] createThumbnail failed:', thumbErr)
        const errMsg: string = thumbErr != null ? `${thumbErr}` : t('messageInput.unknownError')
        showToast(`${errMsg}`)
        return
      }
      await sendMediaMessage({ messageInputState,
        conversationID: conversationID ?? '',
        payload: {
          type: 'video',
          videoFilePath,
          videoType,
          duration: durationSec,
          snapshotPath },
        setOfflinePushInfo,
      })
    } catch (e: any) {
      console.error('[ToolsPanel] video pick failed:', e)
      const errMsg: string = e != null ? `${e}` : t('messageInput.unknownError')
      showToast(`${errMsg}`)
    }
  }, [messageInputState, conversationID, setOfflinePushInfo])

  const handleFilePick = useCallback(async (): Promise<void> => {
    try {
      const results = await pick({
        type: [docTypes.allFiles],
      } as Parameters<typeof pick>[0])
      if (results == null || results.length === 0) return
      const result = results[0]
      if (result.uri == null || result.uri.length === 0) return
      let cleanPath = result.uri
      if (cleanPath.startsWith('file://')) {
        cleanPath = cleanPath.slice(7)
        try {
          cleanPath = decodeURIComponent(cleanPath)
        } catch {
        }
      }
      await sendMediaMessage({ messageInputState,
        conversationID: conversationID ?? '',
        payload: {
          type: 'file',
          filePath: cleanPath,
          fileName: result.name ?? 'file',
          fileSize: result.size != null ? result.size : undefined },
        setOfflinePushInfo,
      })
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return
      console.error('[ToolsPanel] file pick failed:', e)
      const errMsg: string = e != null ? `${e}` : t('messageInput.unknownError')
      showToast(`${errMsg}`)
    }
  }, [messageInputState, conversationID, setOfflinePushInfo])

  const handleClick = useCallback(
    (tool: ToolItem) => {
      if (tool.callback) {
        tool.callback(tool)
        return
      }
      switch (tool.id) {
        case 'image':
          void handleImagePick()
          break
        case 'video':
          void handleVideoPick()
          break
        case 'file':
          void handleFilePick()
          break
        case 'voiceCall':
          console.warn('[ToolsPanel] voiceCall: not yet implemented (TODO)')
          break
        case 'videoCall':
          console.warn('[ToolsPanel] videoCall: not yet implemented (TODO)')
          break
        default:
          console.warn(`[ToolsPanel] unknown tool id: ${tool.id}`)
      }
    },
    [handleImagePick, handleVideoPick, handleFilePick]
  )

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {displayList.map((tool, index) => {
          const isLastInRow = (index + 1) % COLUMNS === 0
          return (
            <View key={tool.id} style={[styles.toolItem, isLastInRow && styles.toolItemLastInRow]}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconWrapper,
                  pressed && styles.iconWrapperPressed,
                ]}
                onPress={() => handleClick(tool)}
                android_ripple={{ color: '#F0F2F7', borderless: false }}
              >
                <Image source={tool.icon} style={styles.icon} resizeMode="contain" />
              </Pressable>
              <Text style={styles.toolName} numberOfLines={1}>
                {resolveToolName(tool.name, t)}
              </Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.borderLight },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: rpxToPx(20),
    paddingBottom: rpxToPx(20),
    paddingHorizontal: rpxToPx(48) },
  toolItem: {
    width: `${100 / COLUMNS}%`,
    alignItems: 'center',
    marginBottom: rpxToPx(38),
    paddingHorizontal: 4,
  },
  toolItemLastInRow: {
  },
  iconWrapper: { width: TOOL_ICON_SIZE,
    height: TOOL_ICON_SIZE,
    backgroundColor: '#F9FAFC',
    borderRadius: rpxToPx(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rpxToPx(8) },
  iconWrapperPressed: { backgroundColor: '#F0F2F7' },
  icon: { width: TOOL_ICON_INNER_SIZE,
    height: rpxToPx(42) },
  toolName: { fontSize: rpxToPx(24),
    color: 'rgba(0, 0, 0, 0.40)',
    textAlign: 'center' },
})
