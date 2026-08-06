import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'

export interface ToggleCellProps {
  label: string
  modelValue: boolean
  switchColor?: string
  disabled?: boolean
  onChange?: (value: boolean) => void
}

export const ToggleCell: React.FC<ToggleCellProps> = ({
  label,
  modelValue,
  switchColor = '#0066FF',
  disabled = false,
  onChange,
}) => {
  const [hasInteracted, setHasInteracted] = useState(false)
  const lastTapRef = React.useRef<number>(0)

  const handleSwitchTap = (): void => {
    const now = Date.now()
    if (now - lastTapRef.current < 700) return
    lastTapRef.current = now
    if (disabled) return
    setHasInteracted(true)
    onChange?.(!modelValue)
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSwitchTap}
        style={[
          styles.track,
          hasInteracted && styles.trackAnimated,
          { backgroundColor: modelValue ? switchColor : '#E5E5E5' },
        ]}
      >
        <View
          style={[
            styles.thumb,
            hasInteracted && styles.thumbAnimated,
            {
              transform: [{ translateX: modelValue ? rpxToPx(40) : 0 }],
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  label: {
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.55)',
  },
  track: {
    minWidth: rpxToPx(100),
    height: rpxToPx(60),
    borderRadius: rpxToPx(30),
    paddingTop: rpxToPx(4),
    paddingBottom: rpxToPx(4),
    paddingLeft: rpxToPx(4),
    paddingRight: rpxToPx(4),
    justifyContent: 'center',
  },
  trackAnimated: {
    
    
  },
  thumb: {
    width: rpxToPx(52),
    height: rpxToPx(52),
    borderRadius: rpxToPx(26),
    backgroundColor: '#FFFFFF',
  },
  thumbAnimated: {
    
  },
})

export default ToggleCell
