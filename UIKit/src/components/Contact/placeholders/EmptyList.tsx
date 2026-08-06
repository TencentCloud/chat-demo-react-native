import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../utils/rpxToPx'

export interface EmptyListProps {
  text?: string
}

export const EmptyList: React.FC<EmptyListProps> = ({ text }) => {
  const { t } = useTranslation()
  const displayText = text ?? t('contact.contactsEmpty')
  return (
    <View style={styles.container}>
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
  text: {
    fontSize: rpxToPx(28),
    color: '#999999',
    textAlign: 'center',
  },
})

export default EmptyList
