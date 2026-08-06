import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResultItem } from './ResultItem'
import { SearchResultItemGroupProps, GroupType } from '../types'

import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'

const GROUP_TYPE_TO_AVATAR: Record<string, string> = {
  [GroupType.Work]: 'work',
  [GroupType.Public]: 'public',
  [GroupType.Meeting]: 'meeting',
  [GroupType.AVChatRoom]: 'avchatroom',
  [GroupType.Community]: 'public',
}

export const GroupResultItem: React.FC<SearchResultItemGroupProps> = ({
  group,
  keyword = '',
  Avatar = DefaultAvatar,
}) => {
  const { t } = useTranslation()
  const displayName = group.groupName || group.groupID || t('searchPlaceholder.unknownGroup')
  const defaultAvatarType = group.groupType ? GROUP_TYPE_TO_AVATAR[group.groupType] || 'public' : 'public'
  const subtitle = t('searchPlaceholder.groupMemberCount', { count: group.memberCount ?? 0 })
  const titleSuffix = `(${group.groupID})`

  return (
    <ResultItem
      avatarURL={group.groupAvatarURL || ''}
      title={displayName}
      titleSuffix={titleSuffix}
      subtitle={subtitle}
      keyword={keyword}
      Avatar={Avatar}
      defaultAvatarType={defaultAvatarType}
    />
  )
}

export default GroupResultItem
