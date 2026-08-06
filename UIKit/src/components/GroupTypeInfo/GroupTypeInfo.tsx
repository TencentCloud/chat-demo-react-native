import React from 'react'
import { Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { GROUP_TYPES } from '../CreateGroup/constants/groupTypes'
import { rpxToPx } from '../../utils/rpxToPx'
import { useTranslation } from 'react-i18next'
import { iconAssets } from '../../static/iconBase64'


const ICON_MAP: Record<string, any> = {
  Work: iconAssets['static/icon/work-group.png'],
  Public: iconAssets['static/icon/public-group.png'],
  Meeting: iconAssets['static/icon/meeting-group.png'],
  AVChatRoom: iconAssets['static/icon/AVChatRoom-group.png'],
}

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

const DEFAULT_DOC_URL = 'https://cloud.tencent.com/document/product/269/75697'

export interface GroupTypeInfoProps {
  showDocumentationLink?: boolean
  onSelectType?: (groupTypeId: string) => void
}

export const GroupTypeInfo: React.FC<GroupTypeInfoProps> = ({
  showDocumentationLink = false,
  onSelectType,
}) => {
  const { t } = useTranslation()
  const getIcon = (groupTypeId: string): any => {
    return ICON_MAP[groupTypeId] || iconAssets['static/icon/work-group.png']
  }

  const handleSelectType = (groupTypeId: string): void => {
    onSelectType?.(groupTypeId)
  }

  const handleViewDocumentation = (docUrl?: string): void => {
    const targetUrl: string = docUrl && docUrl.length > 0 ? docUrl : DEFAULT_DOC_URL
    void Linking.openURL(targetUrl)
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {GROUP_TYPES.map((groupType) => (
          <TouchableOpacity
            key={groupType.id}
            style={styles.item}
            activeOpacity={0.7}
            onPress={(): void => handleSelectType(groupType.id)}
          >
            <View style={styles.header}>
              <Image
                source={getIcon(groupType.id)}
                style={styles.icon}
                resizeMode="contain"
              />
              <Text style={styles.title}>{resolveGroupTypeName(groupType.id, t)}</Text>
            </View>
            <Text style={styles.desc}>
              {resolveGroupTypeDescription(groupType.id, t)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showDocumentationLink ? (
        <View style={styles.bottomLink}>
          <TouchableOpacity
            onPress={(): void => handleViewDocumentation()}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>{t('groupTypeInfo.viewDoc')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: rpxToPx(32),
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(16),
    padding: rpxToPx(32),
    marginBottom: rpxToPx(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rpxToPx(16),
  },
  icon: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    borderRadius: rpxToPx(10),
    marginRight: rpxToPx(24),
  },
  title: {
    fontSize: rpxToPx(32),
    color: '#000000',
    opacity: 0.9,
    flex: 1,
  },
  desc: {
    fontSize: rpxToPx(26),
    color: '#000000',
    opacity: 0.55,
    lineHeight: rpxToPx(40),
  },
  bottomLink: {
    alignItems: 'center',
    paddingVertical: rpxToPx(100),
    paddingHorizontal: rpxToPx(32),
  },
  linkText: {
    fontSize: rpxToPx(30),
    color: '#4285F4',
  },
})

export default GroupTypeInfo
