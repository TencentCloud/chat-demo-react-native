import React, { useMemo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'
import { PresearchPlaceholderProps, PresearchPlaceholderEmits } from '../types'
import { iconAssets } from '../../../static/iconBase64'

import { ImageSourcePropType } from 'react-native'
const ICON_SEARCH: ImageSourcePropType = iconAssets['static/icon/search.png']

export const SearchResultsPresearch: React.FC<PresearchPlaceholderProps> = ({
  searchHistory = [],
  keyword = '',
  showCloudSearch = false,
}) => {
  return null
}

export interface SearchResultsPresearchFullProps extends PresearchPlaceholderProps {
  onHistoryClick?: PresearchPlaceholderEmits['historyClick']
  onCloudSearchClick?: PresearchPlaceholderEmits['cloudSearchClick']
}

export const SearchResultsPresearchFull: React.FC<SearchResultsPresearchFullProps> = ({
  searchHistory = [],
  keyword = '',
  showCloudSearch = false,
  onHistoryClick,
  onCloudSearchClick,
}) => {
  const { t } = useTranslation()
  const filteredHistory = useMemo(() => {
    if (!keyword) return searchHistory
    const kw = keyword.toLowerCase()
    return searchHistory.filter((item) => item.toLowerCase().includes(kw))
  }, [keyword, searchHistory])

  const highlightParts = (text: string): { before: string; match: string; after: string } => {
    if (!keyword) return { before: text, match: '', after: '' }
    const kw = keyword.toLowerCase()
    const lowerText = text.toLowerCase()
    const index = lowerText.indexOf(kw)
    if (index === -1) return { before: text, match: '', after: '' }
    return {
      before: text.substring(0, index),
      match: text.substring(index, index + keyword.length),
      after: text.substring(index + keyword.length),
    }
  }

  return (
    <View style={styles.container}>
      {filteredHistory.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.title}>{t('searchPlaceholder.history')}</Text>
          {filteredHistory.map((item, index) => {
            const parts = highlightParts(item)
            return (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.item}
                activeOpacity={0.7}
                onPress={() => onHistoryClick?.(item)}
              >
                <Image source={ICON_SEARCH} style={styles.itemIcon} resizeMode="contain" />
                <View style={styles.itemTextWrapper}>
                  {parts.before.length > 0 ? <Text style={styles.itemText}>{parts.before}</Text> : null}
                  {parts.match.length > 0 ? (
                    <Text style={[styles.itemText, styles.highlight]}>{parts.match}</Text>
                  ) : null}
                  {parts.after.length > 0 ? <Text style={styles.itemText}>{parts.after}</Text> : null}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      ) : null}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F7',
  },
  section: {
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(40),
    paddingBottom: rpxToPx(10),
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(48),
    color: 'rgba(0, 0, 0, 0.55)',
    paddingBottom: rpxToPx(8),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(16),
  },
  itemIcon: {
    width: rpxToPx(36),
    height: rpxToPx(36),
    marginRight: rpxToPx(16),
  },
  itemTextWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  itemText: {
    fontSize: rpxToPx(32),
    fontWeight: '400',
    lineHeight: rpxToPx(45),
    color: 'rgba(0, 0, 0, 0.9)',
  },
  highlight: {
    color: '#1C66E5',
  },
  cloud: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(40),
    borderTopWidth: rpxToPx(2),
    borderTopColor: '#F0F2F7',
  },
  cloudIconWrapper: {
    width: rpxToPx(60),
    height: rpxToPx(60),
    borderRadius: rpxToPx(30),
    backgroundColor: '#1C66E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rpxToPx(20),
  },
  cloudIcon: {
    width: rpxToPx(32),
    height: rpxToPx(32),
  },
  cloudText: {
    fontSize: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
    color: 'rgba(0, 0, 0, 0.9)',
  },
})

export default SearchResultsPresearchFull
