import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from './utils/rpxToPx'
import { useTranslation } from 'react-i18next'
import { SearchBarEmits, SearchBarProps, SearchBarRef } from './types'
import { iconAssets } from '../../static/iconBase64'

const ICON_SEARCH: ImageSourcePropType = iconAssets['static/icon/search.png']
const ICON_CLOSE: ImageSourcePropType = iconAssets['static/icon/close.png']

export interface SearchBarFullProps extends SearchBarProps {
  onUpdateModelValue?: SearchBarEmits['update:modelValue']
  onInput?: SearchBarEmits['input']
  onSearch?: SearchBarEmits['search']
  onCancel?: SearchBarEmits['cancel']
  onFocus?: SearchBarEmits['focus']
  onBlur?: SearchBarEmits['blur']
  onClear?: SearchBarEmits['clear']
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarFullProps>((props, ref) => {
  const { t } = useTranslation()
  const {
    placeholder, 
    modelValue = '',
    autoFocus = false,
    showCancel = true,
    cancelText, 
    disabled = false,
    onUpdateModelValue,
    onInput,
    onSearch,
    onCancel,
    onFocus,
    onBlur,
    onClear,
  } = props

  const resolvedPlaceholder = placeholder ?? t('common.search')
  const resolvedCancelText = cancelText ?? t('search.cancelText')
  void resolvedPlaceholder
  void resolvedCancelText

  const inputRef = useRef<TextInput>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }))

  const handleChangeText = (value: string) => {
    onUpdateModelValue?.(value)
    onInput?.(value)
  }

  const handleFocus = () => onFocus?.()
  const handleBlur = () => onBlur?.()
  const handleSubmit = () => onSearch?.(modelValue || '')
  const handleClearPress = () => {
    onUpdateModelValue?.('')
    onClear?.()
  }
  const handleCancelPress = () => {
    onUpdateModelValue?.('')
    onCancel?.()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} style={styles.inputWrapper}>
        <Image source={ICON_SEARCH} style={styles.icon} resizeMode="contain" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={modelValue}
          placeholder={resolvedPlaceholder}
          placeholderTextColor="#BBBBBB"
          autoFocus={autoFocus}
          editable={!disabled}
          returnKeyType="search"
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
        />
        {modelValue && modelValue.length > 0 ? (
          <TouchableOpacity style={styles.clear} activeOpacity={0.7} onPress={handleClearPress}>
            <Image source={ICON_CLOSE} style={styles.clearIcon} resizeMode="contain" />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {showCancel ? (
        <TouchableOpacity activeOpacity={0.7} onPress={handleCancelPress}>
          <Text style={styles.cancel}>{resolvedCancelText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

SearchBar.displayName = 'SearchBar'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: rpxToPx(20),
    paddingHorizontal: rpxToPx(32),
    paddingBottom: rpxToPx(34),
    backgroundColor: '#ffffff',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F7',
    borderRadius: rpxToPx(8),
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(24),
  },
  icon: {
    width: rpxToPx(36),
    height: rpxToPx(36),
    marginRight: rpxToPx(13),
  },
  input: {
    flex: 1,
    fontWeight: '400',
    height: rpxToPx(46),
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.9)',
    padding: 0,
  },
  clear: {
    padding: rpxToPx(8),
    marginLeft: rpxToPx(8),
  },
  clearIcon: {
    width: rpxToPx(28),
    height: rpxToPx(28),
  },
  cancel: {
    fontWeight: '400',
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(45),
    color: 'rgba(0, 0, 0, 0.9)',
    marginLeft: rpxToPx(20),
    paddingVertical: rpxToPx(8),
  },
})

export default SearchBar
