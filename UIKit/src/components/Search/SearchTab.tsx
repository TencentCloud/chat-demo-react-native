import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from './utils/rpxToPx'
import { SearchTabEmits, SearchTabProps, SearchTabValue } from './types'

export interface SearchTabFullProps extends SearchTabProps {
  onUpdateModelValue?: SearchTabEmits['update:modelValue']
  onChange?: SearchTabEmits['change']
}

const DEFAULT_TABS_VALUES = [SearchTabValue.All, SearchTabValue.Friend, SearchTabValue.Group, SearchTabValue.Message]

export const SearchTab: React.FC<SearchTabFullProps> = ({
  modelValue = SearchTabValue.All,
  tabs,
  onUpdateModelValue,
  onChange,
}) => {
  const { t } = useTranslation()
  const localTabs = useMemo(() => {
    if (tabs && tabs.length > 0) return tabs
    return [
      { label: t('search.all'), value: SearchTabValue.All },
      { label: t('search.users'), value: SearchTabValue.Friend },
      { label: t('search.groups'), value: SearchTabValue.Group },
      { label: t('search.messages'), value: SearchTabValue.Message },
    ]
  }, [tabs, t])
  const handleClick = (value: SearchTabValue) => {
    if (value !== modelValue) {
      onUpdateModelValue?.(value)
      onChange?.(value)
    }
  }

  return (
    <View style={styles.container}>
      {localTabs.map((tab) => {
        const isActive = modelValue === tab.value
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.item, isActive && styles.itemActive]}
            activeOpacity={0.7}
            onPress={() => handleClick(tab.value)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: rpxToPx(1),
    borderTopColor: '#E6E9F0',
    paddingTop: rpxToPx(20),
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rpxToPx(20),
    marginLeft: rpxToPx(40),
    borderBottomWidth: rpxToPx(4),
    borderBottomColor: 'transparent',
  },
  itemActive: {
    borderBottomColor: '#1C66E5',
  },
  text: {
    fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: '#666666',
  },
  textActive: {
    color: '#1C66E5',
  },
})

export default SearchTab
