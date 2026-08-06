import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { theme, fontSize, spacing } from '../../utils/theme'

export const EmptyPlaceholder: React.FC<{ text?: string }> = ({ text }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.text}>{text ?? t('common.empty')}</Text>
    </View>
  )
}

export const LoadingPlaceholder: React.FC<{ text?: string }> = ({ text }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.text}>{text ?? t('common.loading')}</Text>
    </View>
  )
}

export const LoadErrorPlaceholder: React.FC<{
  text?: string
  onRetry?: () => void
}> = ({ text, onRetry }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{text ?? t('toast.networkError')}</Text>
      {onRetry && (
        <Text style={styles.retry} onPress={onRetry}>
          {t('common.retry')}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    color: theme.textTertiary,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    color: theme.primary,
    textDecorationLine: 'underline',
  },
})
