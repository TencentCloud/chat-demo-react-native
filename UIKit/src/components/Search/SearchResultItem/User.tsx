import React, { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { ResultItem } from './ResultItem'
import { SearchResultItemUserProps, FriendSearchInfo, UserProfile, GroupMember } from '../types'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'

export const UserResultItem: React.FC<SearchResultItemUserProps> = (props) => {
  const { t } = useTranslation()
  const { type, user, keyword = '', Avatar = DefaultAvatar } = props

  let displayName = t('searchPlaceholder.unknownUser')
  if (type === 'friend') {
    const friend = user as FriendSearchInfo
    displayName = friend.friendRemark || friend.userInfo?.nickname || friend.userID || t('searchPlaceholder.unknownUser')
  } else if (type === 'groupMember') {
    const member = user as GroupMember
    displayName = member.nameCard || member.friendRemark || member.nickname || member.userID || t('searchPlaceholder.unknownUser')
  } else {
    const u = user as UserProfile
    displayName = u.nickname || u.userID || t('searchPlaceholder.unknownUser')
  }

  let avatarURL = ''
  if (type === 'friend') {
    const friend = user as FriendSearchInfo
    avatarURL = friend.userInfo?.avatarURL || ''
  } else {
    const u = user as UserProfile | GroupMember
    avatarURL = u.avatarURL || ''
  }

  const titleSuffix = user.userID ? `(${user.userID})` : ''

  const parts: string[] = []
  let profile: UserProfile | null = null
  if (type === 'friend') {
    profile = (user as FriendSearchInfo).userInfo || null
  } else if (type === 'user') {
    profile = user as UserProfile
  }
  if (profile) {
    if (profile.gender === 1) parts.push(t('searchPlaceholder.genderMale'))
    else if (profile.gender === 2) parts.push(t('searchPlaceholder.genderFemale'))
    if (profile.birthday) {
      const birthYear = new Date(profile.birthday * 1000).getFullYear()
      const age = new Date().getFullYear() - birthYear
      if (age > 0 && age < 150) parts.push(t('searchPlaceholder.ageFormat', { age }))
    }
  }
  const subtitle = parts.join(' ')

  return (
    <ResultItem
      avatarURL={avatarURL}
      title={displayName}
      titleSuffix={titleSuffix}
      subtitle={subtitle}
      keyword={keyword}
      Avatar={Avatar}
      defaultAvatarType="user"
    />
  )
}

export default UserResultItem
