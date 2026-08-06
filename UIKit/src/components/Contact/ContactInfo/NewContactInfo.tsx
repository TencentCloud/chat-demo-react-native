import React, { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { FriendApplicationInfo } from '../types'
import type { NewContactInfoProps, NewContactInfoEmits } from '../types'
import { showToast } from '../../../utils/toast'

export interface NewContactInfoComponentProps extends NewContactInfoProps {
  onAccept?: NewContactInfoEmits['onAccept']
  onReject?: NewContactInfoEmits['onReject']
}

export const NewContactInfo: React.FC<NewContactInfoComponentProps> = ({ application = null,
  Avatar = DefaultAvatar,
  onAccept,
  onReject }) => {
  const { t } = useTranslation()
  const { acceptFriendApplication, refuseFriendApplication } = useContactState()

  const [isHandled, setIsHandled] = useState(false)
  const [handledResult, setHandledResult] = useState<'accepted' | 'rejected' | null>(null)

  const handledText = handledResult === 'accepted' ? t('contact.accepted') : handledResult === 'rejected' ? t('contact.rejected') : ''

  const handleAccept = async (): Promise<void> => {
    if (!application || isHandled) return
    try {
      await acceptFriendApplication(application as any)
      setIsHandled(true)
      setHandledResult('accepted')
      showToast(t('contact.accepted'))
      onAccept?.(application)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  const handleReject = async (): Promise<void> => {
    if (!application || isHandled) return
    try {
      await refuseFriendApplication(application as any)
      setIsHandled(true)
      setHandledResult('rejected')
      showToast(t('contact.rejected'))
      onReject?.(application)
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar
            src={application?.avatarURL || ''}
            name={application?.title || application?.userID || ''}
            size={96}
            shape="square"
            defaultAvatarType="user"
            pureMode
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {application?.title}
            </Text>
            <Text style={styles.id} numberOfLines={1}>
              ID: {application?.userID}
            </Text>
            {application?.signature ? (
              <Text style={styles.signature} numberOfLines={2}>
                {t('contact.signature')}{application.signature}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>{t('contact.verifyMessage')}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {application?.addWording || t('common.none')}
            </Text>
          </View>
        </View>

        {!isHandled ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btn}
              activeOpacity={0.7}
              onPress={(): void => {
                handleAccept()
              }}
            >
              <Text style={[styles.btnText, styles.btnTextPrimary]}>{t('contact.accept')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              activeOpacity={0.7}
              onPress={(): void => {
                handleReject()
              }}
            >
              <Text style={[styles.btnText, styles.btnTextDanger]}>{t('contact.reject')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.handled}>
            <Text style={styles.handledText}>{handledText}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F5F5F5' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row',
    padding: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  headerInfo: { flex: 1,
    marginLeft: rpxToPx(30),
    paddingBottom: rpxToPx(20) },
  name: { fontSize: rpxToPx(36),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(48) },
  id: { fontSize: rpxToPx(26),
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(8) },
  signature: { fontSize: rpxToPx(26),
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: rpxToPx(40),
    marginTop: rpxToPx(4) },
  section: { marginBottom: rpxToPx(20),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(20),
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5' },
  label: { fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#888888' },
  value: { flex: 1,
    marginLeft: rpxToPx(10),
    fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#444444' },
  actions: { backgroundColor: '#FFFFFF' },
  btn: { alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rpxToPx(30),
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5' },
  btnText: { fontSize: rpxToPx(34),
    fontWeight: '400',
    lineHeight: rpxToPx(52) },
  btnTextPrimary: { color: '#1C66E5' },
  btnTextDanger: { color: '#E54545' },
  handled: { paddingVertical: rpxToPx(40),
    paddingHorizontal: rpxToPx(32),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: rpxToPx(20) },
  handledText: { fontSize: rpxToPx(28),
    color: '#999999' },
})

export default NewContactInfo
