import React, { useRef } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../utils/rpxToPx'
import { Popup, PopupRef } from '../Popup/Popup'

export interface ConfirmDialogProps {
  visible: boolean
  title: string
  description?: string
  cancelText?: string
  confirmText?: string
  confirmColor?: string
  closeOnMaskTap?: boolean
  onUpdateVisible?: (value: boolean) => void
  onConfirm?: () => void
  onCancel?: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  description = '',
  cancelText,
  confirmText,
  confirmColor = '#E54545',
  closeOnMaskTap = true,
  onUpdateVisible,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()
  const popupRef = useRef<PopupRef>(null)
  const resolvedCancelText = cancelText ?? t('confirmDialog.cancel')
  const resolvedConfirmText = confirmText ?? t('confirmDialog.confirm')

  const handleConfirm = (): void => {
    popupRef.current?.close(() => {
      onConfirm?.()
    })
  }

  const handleCancel = (): void => {
    popupRef.current?.close(() => {
      onCancel?.()
    })
  }

  const handleVisibleChange = (val: boolean): void => {
    onUpdateVisible?.(val)
  }

  const handleClose = (): void => {
    onCancel?.()
  }

  return (
    <Popup
      ref={popupRef}
      visible={visible}
      closeOnMaskTap={closeOnMaskTap}
      onUpdateVisible={handleVisibleChange}
      onClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {description.length > 0 && <Text style={styles.desc}>{description}</Text>}
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.btn, styles.btnCancel]}
            onPress={handleCancel}
          >
            <Text style={styles.btnTextCancel}>{resolvedCancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.btn, styles.btnConfirm]}
            onPress={handleConfirm}
          >
            <Text style={[styles.btnTextConfirm, { color: confirmColor }]}>
              {resolvedConfirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Popup>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: rpxToPx(24),
    overflow: 'hidden',
    width: rpxToPx(654),
  },
  content: {
    paddingTop: rpxToPx(64),
    paddingHorizontal: rpxToPx(48),
    paddingBottom: rpxToPx(40),
  },
  title: {
    fontSize: rpxToPx(36),
    color: 'rgba(0, 0, 0, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  desc: {
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
    marginTop: rpxToPx(12),
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  btn: {
    flex: 1,
    paddingVertical: rpxToPx(32),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnCancel: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E5E5E5',
    borderBottomLeftRadius: rpxToPx(24),
  },
  btnConfirm: {
    borderBottomRightRadius: rpxToPx(24),
  },
  btnTextCancel: {
    fontSize: rpxToPx(32),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  btnTextConfirm: {
    fontSize: rpxToPx(32),
    fontWeight: '500',
  },
})

export default ConfirmDialog
