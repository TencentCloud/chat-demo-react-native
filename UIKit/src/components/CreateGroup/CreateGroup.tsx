import React, { useEffect, useMemo, useState } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useLoginState,
  useGroupState,
  MessageInputState } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../utils/rpxToPx'
import { GROUP_TYPES,
  DEFAULT_GROUP_AVATARS,
  getGroupTypeById,
  type GroupType } from './constants/groupTypes'
import { safeJsonParse } from './utils/utsUtils'
import { useTranslation } from 'react-i18next'
import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'

type SendMessagePayload =
  | { type: 'text'; text: string }
  | { type: 'custom'; customData: string; description?: string; extensionInfo?: string }
  | { type: 'image'; imagePath: string; imageWidth?: number; imageHeight?: number }
  | { type: 'audio'; audioFilePath: string; duration: number }
  | {
      type: 'video';
      videoFilePath: string;
      videoType?: string;
      duration?: number;
      snapshotPath: string;
      snapshotWidth?: number;
      snapshotHeight?: number;
    }
  | { type: 'file'; filePath: string; fileName: string; fileSize?: number }
  | { type: 'face'; index: number; data: string }


export interface CreateGroupUserLite {
  userID: string
  nickname: string
}

export interface CreateGroupProps {
  selectedUsers?: CreateGroupUserLite[]
  controlledGroupType?: GroupType
}

export interface CreateGroupEmits {
  onBack?: () => void
  onCreateSuccess?: (info: {
    groupID: string
    conversationID: string
  }) => void
  onNavigateToGroupType?: (currentTypeId: string) => void
  onGroupTypeSelected?: (groupType: GroupType) => void
}


const ARROW_RIGHT_ICON = iconAssets['components/ChatSetting/assets/nvue_arrow-right.png']

const GROUP_TYPE_NAME_KEYS: Record<string, string> = {
  Work: 'createGroup.workName',
  Public: 'createGroup.publicName',
  Meeting: 'createGroup.meetingName',
  AVChatRoom: 'createGroup.avchatroomName',
}
const GROUP_TYPE_DESC_KEYS: Record<string, string> = {
  Work: 'createGroup.workDescription',
  Public: 'createGroup.publicDescription',
  Meeting: 'createGroup.meetingDescription',
  AVChatRoom: 'createGroup.avchatroomDescription',
}

type TFunction = (key: string, options?: any) => string

const resolveGroupTypeName = (id: string, t: TFunction): string => {
  const key = GROUP_TYPE_NAME_KEYS[id]
  return key ? t(key) : t('createGroup.unknownGroupType')
}

const resolveGroupTypeDescription = (id: string, t: TFunction): string => {
  const key = GROUP_TYPE_DESC_KEYS[id]
  return key ? t(key) : ''
}

export const CreateGroup: React.FC<CreateGroupProps & CreateGroupEmits> = ({ selectedUsers = [],
  controlledGroupType,
  onBack,
  onCreateSuccess,
  onNavigateToGroupType,
  onGroupTypeSelected }) => {
  const { t } = useTranslation()
  const { loginUserInfo } = useLoginState()
  const { createGroup } = useGroupState()

  const [groupName, setGroupName] = useState<string>('')
  const [groupID, setGroupID] = useState<string>('')
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0)
  const [avatarLoadedMap, setAvatarLoadedMap] = useState<Record<number, boolean>>({})

  const [selectedGroupType, setSelectedGroupType] = useState<GroupType>(
    GROUP_TYPES[0]
  )

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const canCreate = useMemo<boolean>(
    () => groupName.trim().length > 0 && !isCreating,
    [groupName, isCreating]
  )

  useEffect((): void => {
    setIsCreating(false)
  }, [])

  useEffect((): (() => void) | void => {
    if (!onGroupTypeSelected) return
    return (): void => {
    }
  }, [onGroupTypeSelected])

  useEffect((): void => {
    if (controlledGroupType != null) {
      setSelectedGroupType(controlledGroupType)
    }
  }, [controlledGroupType])

  const onAvatarLoad = (index: number): void => {
    setAvatarLoadedMap((prev) => ({ ...prev, [index]: true }))
  }

  const onAvatarError = (index: number): void => {
    setAvatarLoadedMap((prev) => ({ ...prev, [index]: true }))
    console.warn(t('createGroup.avatarLoadFailed', { index }))
  }

  const blurAllInputs = (inputRefs: Array<{ blur: () => void } | null>): void => {
    inputRefs.forEach((ref) => {
      if (ref != null && typeof ref.blur === 'function') {
        try {
          ref.blur()
        } catch (e) {
        }
      }
    })
  }

  const handleGroupTypeSelect = (): void => {
    Keyboard.dismiss()
    if (onNavigateToGroupType) {
      onNavigateToGroupType(selectedGroupType.id)
    }
  }


  const handleAvatarSelect = (index: number): void => {
    setSelectedAvatarIndex(index)
  }

  const handleGroupCreatedSuccess = async (createdGroupID: string): Promise<void> => {
    const conversationID = `group_${createdGroupID}`

    const messageInputState = MessageInputState.getInstance(conversationID)

    try { 
      const customPayload: SendMessagePayload = {
        type: 'custom',
        customData: JSON.stringify({
          version: 1,
          businessID: 'group_create',
          opUser: loginUserInfo?.userID ?? '',
          content: t('createGroup.systemMessageContent'),
          cmd: 0 }),
      }
      await messageInputState?.sendMessage(customPayload)
    } catch (e) {
      console.error('[CreateGroup] sendMessage(custom) failed:', e)
    }

    if (onCreateSuccess) {
      onCreateSuccess({ groupID: createdGroupID, conversationID })
    }
  }

  const handleCreate = async (): Promise<void> => { 
    if (!canCreate || isCreating) return
    setIsCreating(true)

    try {
      const memberList: string[] = (selectedUsers || []).map((u) => u.userID)

      const createdGroupID = await createGroup({
        groupType: selectedGroupType.id,
        groupName,
        groupID,
        avatarURL: DEFAULT_GROUP_AVATARS[selectedAvatarIndex],
        memberList } as any)

      if (!createdGroupID) {
        showToast(t('createGroup.createFailed'))
        setIsCreating(false)
        return
      }

      handleGroupCreatedSuccess(createdGroupID)
    } catch (error: any) {
      let errMsg: string = error?.message || t('createGroup.createFailed')
      const rawMsg: string = String(error?.message || '')
      if (error && error.errCode === 80001) {
        const match = rawMsg.match(/beat word:\s*([^|]+?)\s*(\||$)/i)
        const beatWord: string = match ? match[1].trim() : ''
        errMsg = beatWord
          ? t('createGroup.createFailedBanned', { word: beatWord })
          : t('createGroup.createFailedBannedShort')
      }

      showToast(errMsg)
      setIsCreating(false)
    }
  }


  void onGroupTypeSelected 
  return (
    <View style={styles.createGroup}>
      <View style={styles.formContainer}>
        <ScrollView
          style={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('createGroup.groupName')}</Text>
            <TextInput
              style={styles.formInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder={t('createGroup.groupNamePlaceholder')}
              placeholderTextColor="#BBBBBB"
              maxLength={20}
              returnKeyType="done"
            />
          </View>

          <View style={[styles.formItem, styles.formItemConnected]}>
            <Text style={styles.formLabel}>{t('createGroup.groupId')}</Text>
            <TextInput
              style={styles.formInput}
              value={groupID}
              onChangeText={setGroupID}
              placeholder={t('createGroup.groupIdPlaceholder')}
              placeholderTextColor="#BBBBBB"
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.formItemClickable}
            onPress={handleGroupTypeSelect}
          >
            <Text style={styles.formLabel}>{t('createGroup.groupType')}</Text>
            <View style={styles.formValue}>
              <Text style={styles.formText}>{resolveGroupTypeName(selectedGroupType.id, t)}</Text>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.groupTypeDesc}>
            <Text style={styles.descText}>{resolveGroupTypeDescription(selectedGroupType.id, t)}</Text>
          </View>

          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>{t('createGroup.groupAvatar')}</Text>
            <View style={styles.avatarGrid}>
              {DEFAULT_GROUP_AVATARS.map((avatarURL, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[
                    styles.avatarWrapper,
                    selectedAvatarIndex === index && styles.avatarWrapperSelected,
                  ]}
                  onPress={(): void => handleAvatarSelect(index)}
                >
                  <View style={styles.avatarItem}>
                    <Image
                      source={{ uri: avatarURL }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onLoad={(): void => onAvatarLoad(index)}
                      onError={(): void => onAvatarError(index)}
                    />
                    {!avatarLoadedMap[index] && (
                      <View style={styles.avatarLoading}>
                        <View style={styles.loadingPlaceholder} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.createButton,
              !canCreate && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={styles.createButtonText}>{t('createGroup.create')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ createGroup: {
    flex: 1,
    backgroundColor: '#F5F5F5' },
  formContainer: { flex: 1,
    flexDirection: 'column' },
  formContent: { flex: 1,
    paddingBottom: rpxToPx(180) },
  formItem: { height: rpxToPx(120),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rpxToPx(32),
    marginTop: rpxToPx(20) },
  formItemConnected: { marginTop: rpxToPx(2) },
  formItemClickable: { height: rpxToPx(120),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rpxToPx(32),
    marginTop: rpxToPx(2) },
  formLabel: { fontSize: rpxToPx(32),
    color: '#000000',
    fontWeight: '400',
    opacity: 0.55 },
  formInput: { flex: 1,
    fontSize: rpxToPx(32),
    color: '#333333',
    textAlign: 'right',
    paddingVertical: 0 },
  formValue: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end' },
  formText: { fontSize: rpxToPx(32),
    color: '#333333',
    marginRight: rpxToPx(16) },
  arrowIcon: { fontSize: rpxToPx(40),
    color: '#999999',
    lineHeight: rpxToPx(40) },
  groupTypeDesc: { paddingHorizontal: rpxToPx(32),
    paddingVertical: rpxToPx(10),
    borderRadius: rpxToPx(16) },
  descText: { fontSize: rpxToPx(28),
    color: '#666666',
    lineHeight: rpxToPx(40) },
  avatarSection: { marginTop: rpxToPx(20),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(16),
    paddingHorizontal: rpxToPx(32),
    paddingVertical: rpxToPx(32) },
  sectionTitle: { fontSize: rpxToPx(32),
    color: '#000000',
    fontWeight: '400',
    opacity: 0.55,
    marginBottom: rpxToPx(20) },
  avatarGrid: { flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between' },
  avatarWrapper: { width: rpxToPx(128),
    height: rpxToPx(128),
    marginBottom: rpxToPx(24),
    borderRadius: rpxToPx(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent' },
  avatarWrapperSelected: { backgroundColor: '#1C66E5' },
  avatarItem: { width: rpxToPx(120),
    height: rpxToPx(120),
    borderRadius: rpxToPx(16),
    overflow: 'hidden',
    position: 'relative' },
  avatarImage: { width: rpxToPx(120),
    height: rpxToPx(120),
    backgroundColor: '#F5F5F5',
    borderRadius: rpxToPx(16) },
  avatarLoading: { position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA' },
  loadingPlaceholder: { width: rpxToPx(60),
    height: rpxToPx(60),
    borderRadius: rpxToPx(30),
    backgroundColor: '#E9ECEF' },
  footer: { height: rpxToPx(180),
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: rpxToPx(32),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5' },
  createButton: { width: rpxToPx(153),
    height: rpxToPx(60),
    borderRadius: rpxToPx(4),
    backgroundColor: '#1C66E5',
    alignItems: 'center',
    justifyContent: 'center' },
  createButtonDisabled: { backgroundColor: '#CCE2FF' },
  createButtonText: { fontSize: rpxToPx(32),
    color: '#FFFFFF',
    fontWeight: '500' },
})

export default CreateGroup
