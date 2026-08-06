import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'
import { MessageAdvancedEmits, MessageAdvancedProps } from '../types'

type DateRangeType = 'all' | 'today' | 'three_days' | 'seven_days'

export interface MessageAdvancedFullProps extends MessageAdvancedProps {
  onUpdateStartDate?: MessageAdvancedEmits['update:startDate']
  onUpdateEndDate?: MessageAdvancedEmits['update:endDate']
  onChange?: MessageAdvancedEmits['change']
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatShort = (dateStr: string): string => {
  const parts = dateStr.split('-')
  return `${parts[1]}/${parts[2]}`
}

export const MessageAdvanced: React.FC<MessageAdvancedFullProps> = ({
  startDate = '',
  endDate = '',
  onUpdateStartDate,
  onUpdateEndDate,
  onChange,
}) => {
  const { t } = useTranslation()
  const rangeOptions = useMemo<{ value: DateRangeType; label: string }[]>(() => [
    { value: 'all', label: t('searchAdvanced.all') },
    { value: 'today', label: t('searchAdvanced.today') },
    { value: 'three_days', label: t('searchAdvanced.last3Days') },
    { value: 'seven_days', label: t('searchAdvanced.last7Days') },
  ], [t])
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('all')
  const [localStart, setLocalStart] = useState(startDate)
  const [localEnd, setLocalEnd] = useState(endDate)

  useEffect(() => setLocalStart(startDate), [startDate])
  useEffect(() => setLocalEnd(endDate), [endDate])

  const displayDateRange =
    localStart && localEnd ? `${formatShort(localStart)}-${formatShort(localEnd)}` : t('searchAdvanced.all')

  const handleOptionClick = (item: { value: DateRangeType; label: string }) => {
    if (item.value === 'all') {
      setSelectedRange('all')
      return
    }
    handleSelect(item.value)
  }

  const handleSelect = (range: DateRangeType) => {
    if (selectedRange === range) {
      setSelectedRange('all')
      setLocalStart('')
      setLocalEnd('')
      onUpdateStartDate?.('')
      onUpdateEndDate?.('')
      onChange?.('', '')
      return
    }

    setSelectedRange(range)
    const today = new Date()
    let startDateStr = ''
    const endDateStr = formatDate(today)

    switch (range) {
      case 'today':
        startDateStr = formatDate(today)
        break
      case 'three_days': {
        const d = new Date(today)
        d.setDate(today.getDate() - 2)
        startDateStr = formatDate(d)
        break
      }
      case 'seven_days': {
        const d = new Date(today)
        d.setDate(today.getDate() - 6)
        startDateStr = formatDate(d)
        break
      }
    }

    setLocalStart(startDateStr)
    setLocalEnd(endDateStr)
    onUpdateStartDate?.(startDateStr)
    onUpdateEndDate?.(endDateStr)
    onChange?.(startDateStr, endDateStr)
  }

  return (
    <View style={styles.container}>
      <View style={styles.optionsRow}>
        <Text style={styles.label}>{t('searchAdvanced.dateLabel')}</Text>
        {rangeOptions.map((item) => {
          const isActive = selectedRange === item.value
          return (
            <TouchableOpacity
              key={item.value}
              style={styles.optionCell}
              activeOpacity={0.7}
              onPress={() => handleOptionClick(item)}
            >
              <Text style={[styles.option, isActive && styles.optionActive]}>
                {item.value === 'all' ? displayDateRange : item.label}
              </Text>
              {item.value === 'all' ? <Text style={styles.arrow}>▼</Text> : null}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpxToPx(40),
    paddingTop: rpxToPx(20),
  },
  label: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
    marginRight: rpxToPx(16),
  },
  optionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: rpxToPx(20),
  },
  option: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
    padding: rpxToPx(12),
  },
  optionActive: {
    color: '#1C66E5',
  },
  arrow: {
    fontSize: rpxToPx(20),
    color: 'rgba(0, 0, 0, 0.4)',
  },
})

export default MessageAdvanced
