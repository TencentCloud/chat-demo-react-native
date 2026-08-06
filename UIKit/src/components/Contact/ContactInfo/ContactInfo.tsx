import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { AddFriendInfo } from './AddFriendInfo'
import { NewContactInfo } from './NewContactInfo'
import { FriendInfo } from './FriendInfo'
import { rpxToPx } from '../../../utils/rpxToPx'
import { useTranslation } from 'react-i18next'
import type {
  ContactInfoContainerProps,
  ContactInfoContainerEmits,
} from '../types'

export type ContactInfoComponentProps = ContactInfoContainerProps & ContactInfoContainerEmits
export type ContactInfoComponentEmits = ContactInfoContainerEmits

export const ContactInfo: React.FC<ContactInfoComponentProps> = ({
  type,
  userInfo = null,
  friendInfo = null,
  friendApplication = null,
  canAddFriend = true,
  Avatar = DefaultAvatar,
  friendInfoActions = [],
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
  onSendMessage,
  onRemarkEdit,
  onDeleteFriend,
  onMuteChange,
  onPinChange,
  onBlacklistChange,
}) => {
  const { t } = useTranslation()
  if (type === 'addFriend') {
    return (
      <AddFriendInfo
        userInfo={userInfo as any}
        Avatar={Avatar}
        onAddFriend={onAddFriend as any}
        onSendMessage={onSendMessage}
      />
    )
  }

  if (type === 'newContact') {
    return (
      <NewContactInfo
        application={friendApplication}
        Avatar={Avatar}
        onAccept={onAcceptFriend}
        onReject={onRejectFriend}
      />
    )
  }

  if (type === 'friend') {
    return (
      <FriendInfo
        friendInfo={friendInfo}
        Avatar={Avatar}
        actions={friendInfoActions}
        onSendMessage={onSendMessage}
        onRemarkEdit={onRemarkEdit}
        onMuteChange={onMuteChange}
        onPinChange={onPinChange}
        onBlacklistChange={onBlacklistChange}
        onDeleteFriend={onDeleteFriend}
      />
    )
  }

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{t('contact.pleaseSelectContact')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: rpxToPx(28),
    color: '#999999',
  },
})

export default ContactInfo
