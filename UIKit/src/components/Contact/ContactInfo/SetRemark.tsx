import React, { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useContactState } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../utils/rpxToPx'
import type { SetRemarkProps, SetRemarkEmits } from '../types'

import { Avatar } from '../../Avatar/Avatar'
import { iconAssets } from '../../../static/iconBase64'
import { showToast } from '../../../utils/toast'

export interface SetRemarkComponentProps extends SetRemarkProps {
  onSuccess?: SetRemarkEmits['onSuccess']
  onFail?: SetRemarkEmits['onFail']
  onCancel?: SetRemarkEmits['onCancel']
}

export const SetRemark: React.FC<SetRemarkComponentProps> = ({ userID = '',
  remark = '',
  onSuccess,
  onFail,
  onCancel }) => {
  const { t } = useTranslation()
  const { setFriendRemark, friendList } = useContactState()

  const [remarkInput, setRemarkInput] = useState((): string => {
    if (userID) {
      const friend = (friendList as any[]).find((f: any) => f?.userID === userID)
      if (friend?.friendRemark != null) return friend.friendRemark as string
    }
    return remark || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleClear = (): void => {
    setRemarkInput('')
  }

  const handleSave = async (): Promise<void> => {
    if (isSubmitting) return
    if (!userID) {
      showToast(t('contact.userInfoMissing'))
      return
    }
    setIsSubmitting(true)
    try {
      await setFriendRemark(userID, remarkInput.trim())
      showToast(t('toast.operationSuccess'))
      onSuccess?.(userID, remarkInput.trim())
    } catch (error: any) {
      const msg = (error && error.message) || t('toast.operationFailed')
      showToast(`${msg}`)
      onFail?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formItem}>
          <Text style={styles.formLabel}>{t('contact.friendRemark')}</Text>
          <TextInput
            style={styles.formInput}
            value={remarkInput}
            onChangeText={setRemarkInput}
            placeholder={t('contact.remarkPlaceholder')}
            maxLength={20}
            autoFocus
            placeholderTextColor="#BBBBBB"
          />
          {remarkInput ? (
            <TouchableOpacity style={styles.clear} activeOpacity={0.7} onPress={handleClear}>
              <Avatar src={iconAssets['static/icon/close.png']} name="" size={28} shape="square" pureMode />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.action}>
        <TouchableOpacity
          style={[styles.actionBtn, isSubmitting ? styles.actionBtnDisabled : null]}
          activeOpacity={0.7}
          disabled={isSubmitting}
          onPress={handleSave}
        >
          <Text style={styles.actionBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#F0F2F7' },
  form: { marginHorizontal: rpxToPx(32),
    marginTop: rpxToPx(120),
    marginBottom: rpxToPx(88),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(24) },
  formItem: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(32),
    paddingHorizontal: rpxToPx(20) },
  formLabel: { marginRight: rpxToPx(43),
    fontSize: rpxToPx(32),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(40),
    minWidth: rpxToPx(98) },
  formInput: { flex: 1,
    fontSize: rpxToPx(32),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: rpxToPx(40),
    padding: 0 },
  clear: { padding: rpxToPx(8),
    marginLeft: rpxToPx(8) },
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

export default SetRemark
