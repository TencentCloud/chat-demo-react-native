import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../utils/rpxToPx'

export interface LoadErrorPlaceholderProps {
  error?: Error | null
}

export const LoadErrorPlaceholder: React.FC<LoadErrorPlaceholderProps> = ({ error }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('conversationList.loadError')}</Text>
      {error != null && <Text style={styles.message}>{error.message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rpxToPx(100),
    paddingHorizontal: rpxToPx(60),
  },
  text: {
    fontSize: rpxToPx(28),
    color: '#FF4D4F',
    textAlign: 'center',
    marginBottom: rpxToPx(20),
  },
  message: {
    fontSize: rpxToPx(24),
    color: '#999999',
    textAlign: 'center',
  },
})

export default LoadErrorPlaceholder
