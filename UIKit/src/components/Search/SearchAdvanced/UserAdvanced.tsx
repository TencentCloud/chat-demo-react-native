import React, { useEffect, useState, useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'
import { Gender, UserAdvancedEmits, UserAdvancedProps } from '../types'

export interface UserAdvancedFullProps extends UserAdvancedProps {
  onUpdateMinBirthday?: UserAdvancedEmits['update:minBirthday']
  onUpdateMaxBirthday?: UserAdvancedEmits['update:maxBirthday']
  onUpdateGender?: UserAdvancedEmits['update:gender']
  onChange?: UserAdvancedEmits['change']
  onClick?: UserAdvancedEmits['click']
}

const birthdayToAge = (birthday: number | undefined): number | undefined => {
  if (birthday === undefined) return undefined
  const str = String(birthday)
  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10)
  const day = parseInt(str.substring(6, 8), 10)
  const today = new Date()
  let age = today.getFullYear() - year
  const monthDiff = today.getMonth() + 1 - month
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age--
  return age
}

const ageToBirthday = (age: number): number => {
  const today = new Date()
  const year = today.getFullYear() - age
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return parseInt(`${year}${month}${day}`, 10)
}

export const UserAdvanced: React.FC<UserAdvancedFullProps> = (props) => {
  const { t } = useTranslation()
  const { minBirthday, maxBirthday, gender = Gender.UNKNOWN, onUpdateMinBirthday, onUpdateMaxBirthday, onUpdateGender, onChange, onClick } = props

  const [selectedMinAge, setSelectedMinAge] = useState(birthdayToAge(maxBirthday) ?? 0)
  const [selectedMaxAge, setSelectedMaxAge] = useState(birthdayToAge(minBirthday) ?? 99)
  const [selectedGender, setSelectedGender] = useState<Gender>(gender)

  useEffect(() => setSelectedMaxAge(birthdayToAge(minBirthday) ?? 99), [minBirthday])
  useEffect(() => setSelectedMinAge(birthdayToAge(maxBirthday) ?? 0), [maxBirthday])
  useEffect(() => setSelectedGender(gender), [gender])

  const genderLabels = useMemo<Record<Gender, string>>(() => ({
    [Gender.UNKNOWN]: t('searchAdvanced.genderAny'),
    [Gender.MALE]: t('searchAdvanced.genderMale'),
    [Gender.FEMALE]: t('searchAdvanced.genderFemale'),
  }), [t])
  const currentGenderLabel = genderLabels[selectedGender]
  const ageRangeText = `${selectedMinAge}-${selectedMaxAge}`

  const handlePress = () => onClick?.()

  const _updateFilter = (minAge: number, maxAge: number, g: Gender) => {
    setSelectedMinAge(minAge)
    setSelectedMaxAge(maxAge)
    setSelectedGender(g)
    const minBirthday = maxAge !== 99 ? ageToBirthday(maxAge) : undefined
    const maxBirthday = minAge !== 0 ? ageToBirthday(minAge) : undefined
    onUpdateMinBirthday?.(minBirthday)
    onUpdateMaxBirthday?.(maxBirthday)
    onUpdateGender?.(g)
    onChange?.(minBirthday, maxBirthday, g)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.optionsRow} activeOpacity={0.7} onPress={handlePress}>
        <Text style={styles.label}>{t('searchAdvanced.genderLabel')}</Text>
        <Text style={[styles.value, styles.valueActive]}>{currentGenderLabel}</Text>
        <Text style={styles.arrow}>▼</Text>
        <Text style={[styles.label, styles.labelSecond]}>{t('searchAdvanced.ageLabel')}</Text>
        <Text style={styles.value}>{ageRangeText}</Text>
      </TouchableOpacity>
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
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(40),
  },
  label: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
    marginRight: rpxToPx(8),
  },
  labelSecond: {
    marginLeft: rpxToPx(32),
  },
  value: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
    padding: rpxToPx(12),
  },
  valueActive: {
    color: '#1C66E5',
  },
  arrow: {
    fontSize: rpxToPx(20),
    color: 'rgba(0, 0, 0, 0.4)',
  },
})

export default UserAdvanced
