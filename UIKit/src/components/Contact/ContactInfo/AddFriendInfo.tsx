import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { ContactInfo } from '../types'
import type { AddFriendInfoProps, AddFriendInfoEmits } from '../types'

export interface AddFriendInfoComponentProps extends AddFriendInfoProps {
  onAddFriend?: AddFriendInfoEmits['onAddFriend']
  onSendMessage?: AddFriendInfoEmits['onSendMessage']
}

export const AddFriendInfo: React.FC<AddFriendInfoComponentProps> = ({
  userInfo = null,
  Avatar = DefaultAvatar,
  onAddFriend,
  onSendMessage,
}) => {
  const { t } = useTranslation()
  const handleAddFriend = (): void => {
    if (!userInfo?.userID) return
    onAddFriend?.(userInfo as ContactInfo)
  }

  const handleSendMessage = (): void => {
    if (userInfo?.userID) onSendMessage?.(userInfo.userID)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar
            src={userInfo?.avatarURL || ''}
            name={userInfo?.nickname || userInfo?.userID || ''}
            size={96}
            shape="square"
            defaultAvatarType="user"
            pureMode
          />
          <View style={styles.headerContent}>
            <Text style={styles.name} numberOfLines={1}>
              {userInfo?.nickname || userInfo?.userID}
            </Text>
            <Text style={styles.id} numberOfLines={1}>
              {t('contact.idLabel')}{userInfo?.userID}
            </Text>
            {(userInfo as any)?.aboutMe ? (
              <Text style={styles.signature} numberOfLines={2}>
                {t('contact.signature')}{(userInfo as any).aboutMe}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.action}
          activeOpacity={0.7}
          onPress={userInfo?.isFriend ? handleSendMessage : handleAddFriend}
        >
          <Text style={styles.actionText}>
            {userInfo?.isFriend ? t('contact.sendMessage') : t('contact.addFriend')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
    marginLeft: rpxToPx(24),
  },
  name: {
    fontSize: rpxToPx(36),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(48),
  },
  id: {
    fontSize: rpxToPx(26),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(8),
  },
  signature: {
    fontSize: rpxToPx(26),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(4),
  },
  action: {
    marginTop: rpxToPx(20),
    paddingVertical: rpxToPx(30),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: rpxToPx(34),
    fontWeight: '400',
    lineHeight: rpxToPx(52),
    color: '#1C66E5',
  },
})

export default AddFriendInfo
