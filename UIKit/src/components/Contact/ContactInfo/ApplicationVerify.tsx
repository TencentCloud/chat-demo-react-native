import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState, useGroupState, useLoginState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { ContactInfo, GroupInfo, ApplicationType } from '../types'
import type { ApplicationVerifyProps, ApplicationVerifyEmits } from '../types'
import { showToast } from '../../../utils/toast'

export interface ApplicationVerifyComponentProps extends ApplicationVerifyProps {
  onSuccess?: ApplicationVerifyEmits['onSuccess']
  onFail?: ApplicationVerifyEmits['onFail']
}

export const ApplicationVerify: React.FC<ApplicationVerifyComponentProps> = ({ type = 'friend',
  userInfo = null,
  groupInfo = null,
  onSuccess,
  onFail }) => {
  const { t } = useTranslation()
  const { joinGroup } = useGroupState()
  const { addFriend } = useContactState()
  const { loginUserInfo } = useLoginState()

  const [verifyMessage, setVerifyMessage] = useState('')
  const [remark, setRemark] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultVerifyMessage = useMemo((): string => {
    const name = (loginUserInfo as any)?.userName || loginUserInfo?.nickname || loginUserInfo?.userID || ''
    return name ? t('contact.verifyMessageDefault', { name }) : t('contact.verifyMessageEmpty')
  }, [loginUserInfo, t])

  const isVerifyMessageEditedRef = useRef(false)
  useEffect(() => {
    if (!isVerifyMessageEditedRef.current) {
      setVerifyMessage(defaultVerifyMessage)
    }
  }, [defaultVerifyMessage])

  const handleVerifyMessageChange = (text: string): void => {
    isVerifyMessageEditedRef.current = true
    setVerifyMessage(text)
  }

  const handleJoinGroup = async (): Promise<void> => {
    const gid = groupInfo?.groupID
    if (!gid) return
    setIsSubmitting(true)
    try {
      const message = verifyMessage.trim() || defaultVerifyMessage
      await joinGroup(gid, message)
      showToast(t('contact.applicationSent'))
      onSuccess?.('group', groupInfo as GroupInfo)
    } catch (error: any) {
      const rawMsg = String((error && error.message) || '')
      const isForbidden = /forbidden to apply/i.test(rawMsg)
      const errMsg = isForbidden
        ? t('contact.groupForbidden')
        : (rawMsg || t('toast.operationFailed'))
      showToast(errMsg)
      onFail?.('group', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFriend = async (): Promise<void> => {
    const uid = userInfo?.userID
    if (!uid) return
    setIsSubmitting(true)
    try {
      const message = verifyMessage.trim() || defaultVerifyMessage
      const res: any = await addFriend(uid, remark.trim(), message)
      const title = (res && res.code === 30539) ? t('contact.applicationSent') : t('contact.addFriendSuccess')
      showToast(title)
      onSuccess?.('friend', userInfo as ContactInfo)
    } catch (error: any) {
      const rawMsg = String((error && error.message) || '')
      const isReverseBlacklisted = /Reverse_Black_List/i.test(rawMsg)
      const errMsg = isReverseBlacklisted
        ? t('contact.blacklistedByPeer')
        : (rawMsg || t('toast.operationFailed'))
      showToast(`${errMsg}`)
      onFail?.('friend', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (): void => {
    if (isSubmitting) return
    if (type === 'group') handleJoinGroup()
    else handleAddFriend()
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('contact.verifyMessage')}</Text>
            <TextInput
              style={styles.formInput}
              value={verifyMessage}
              onChangeText={handleVerifyMessageChange}
              placeholder={defaultVerifyMessage}
              maxLength={100}
              placeholderTextColor="#BBBBBB"
            />
          </View>

          {type === 'friend' ? (
            <View style={styles.formDivider} />
          ) : null}

          {type === 'friend' ? (
            <View style={styles.formItem}>
              <Text style={styles.formLabel}>{t('contact.friendRemark')}</Text>
              <TextInput
                style={styles.formInput}
                value={remark}
                onChangeText={setRemark}
                placeholder={t('contact.remarkPlaceholder')}
                maxLength={50}
                placeholderTextColor="#BBBBBB"
              />
            </View>
          ) : null}
        </View>

        <View style={styles.action}>
          <TouchableOpacity
            style={[styles.actionBtn, isSubmitting ? styles.actionBtnDisabled : null]}
            activeOpacity={0.7}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            <Text style={styles.actionBtnText}>{t('common.send')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F0F2F7' },
  scroll: { flex: 1 },
  form: { marginHorizontal: rpxToPx(32),
    marginTop: rpxToPx(120),
    marginBottom: rpxToPx(88),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(32) },
  formItem: { flexDirection: 'row',
    alignItems: 'center',
    padding: rpxToPx(32) },
  formLabel: { marginRight: rpxToPx(43),
    fontSize: rpxToPx(32),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(40),
    minWidth: rpxToPx(160) },
  formInput: { flex: 1,
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(40),
    padding: 0 },
  formDivider: { height: 1,
    backgroundColor: '#E5E5E5' },
  action: { paddingHorizontal: rpxToPx(75) },
  actionBtn: { backgroundColor: '#1C66E5',
    borderRadius: rpxToPx(48),
    paddingVertical: rpxToPx(26),
    alignItems: 'center',
    justifyContent: 'center' },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: rpxToPx(32),
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: rpxToPx(44) },
})

export default ApplicationVerify
