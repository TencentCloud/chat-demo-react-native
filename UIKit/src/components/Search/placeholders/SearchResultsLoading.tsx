import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'
import { LoadingPlaceholderProps } from '../types'

export const SearchResultsLoading: React.FC<LoadingPlaceholderProps> = ({ text }) => {
  const { t } = useTranslation()
  const displayText = text ?? t('searchPlaceholder.loading')
  return (
    <View style={styles.container}>
      <View style={styles.spinner}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
      <Text style={styles.text}>{displayText}</Text>
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
  spinner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rpxToPx(24),
  },
  dot: {
    width: rpxToPx(16),
    height: rpxToPx(16),
    borderRadius: rpxToPx(8),
    backgroundColor: '#147AFF',
    marginHorizontal: rpxToPx(8),
    opacity: 0.3,
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },
  text: {
    fontSize: rpxToPx(28),
    color: '#999999',
    textAlign: 'center',
  },
})

export default SearchResultsLoading
