import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'

export interface ButtonCellProps {
  label: string
  color?: string
  onClick?: () => void
}

export const ButtonCell: React.FC<ButtonCellProps> = ({
  label,
  color = '#0066FF',
  onClick,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.row} onPress={onClick}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: rpxToPx(100),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  label: {
    fontSize: rpxToPx(32),
    fontWeight: '400',
  },
})

export default ButtonCell
