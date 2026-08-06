import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'

export interface MessageTimeDividerProps {
  timestamp: number
}

const formatDividerTime = (ts: number): string => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  if (sameYear) {
    return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`
}

export const MessageTimeDivider: React.FC<MessageTimeDividerProps> = ({ timestamp }) => {
  const text = useMemo((): string => formatDividerTime(timestamp), [timestamp])
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rpxToPx(10),
    marginVertical: rpxToPx(20),
  },
  content: {
    marginHorizontal: rpxToPx(20),
  },
  text: {
    fontSize: rpxToPx(24),
    color: '#999999',
    lineHeight: rpxToPx(40),
    paddingHorizontal: rpxToPx(16),
    paddingVertical: rpxToPx(8),
    borderRadius: rpxToPx(16),
    overflow: 'visible',
    includeFontPadding: false,
  },
})
