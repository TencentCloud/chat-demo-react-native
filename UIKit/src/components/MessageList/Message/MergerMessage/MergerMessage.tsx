import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'

export interface MergerMessageProps {
  message: MessageInfo
  onMergerClick?: (msgID: string) => void
  onLongPress?: () => void
}

export const MergerMessage: React.FC<MergerMessageProps> = ({ message, onMergerClick: _onMergerClick }) => {
  const { t } = useTranslation()
  const isSelf = message.isSelf === true
  const payload = (message.messagePayload ?? {}) as any

  const title = useMemo((): string => {
    return payload.title || '聊天记录'
  }, [payload])

  const abstractList = useMemo((): string[] => {
    const list: string[] = Array.isArray(payload.abstractList) ? payload.abstractList : []
    return list.slice(0, 4)
  }, [payload])

  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.containerOut : styles.containerIn,
      ]}
    >
      <View style={styles.highlight}>
        <View style={styles.inner}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.abstractList}>
            {abstractList.map((item, idx) => (
              <View key={`abs-${idx}`} style={styles.abstractItem}>
                <Text style={styles.abstractContent} numberOfLines={1}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.label}>{t('message.mergerLabel')}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: rpxToPx(500),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(20),
  },
  containerOut: {},
  containerIn: {},
  highlight: {
    backgroundColor: 'transparent',
    borderRadius: rpxToPx(20),
  },
  inner: {
    paddingHorizontal: rpxToPx(24),
    paddingVertical: rpxToPx(20),
  },
  title: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(42),
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: rpxToPx(10),
  },
  abstractList: {
    marginBottom: rpxToPx(18),
  },
  abstractItem: {
    flexDirection: 'row',
    marginBottom: rpxToPx(8),
  },
  abstractContent: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(36),
    color: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
  },
  label: {
    fontSize: rpxToPx(18),
    lineHeight: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: rpxToPx(1),
    borderTopColor: '#E6E9F0',
    paddingTop: rpxToPx(12),
  },
})
