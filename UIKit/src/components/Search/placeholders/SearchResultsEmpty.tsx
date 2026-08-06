import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'
import { EmptyPlaceholderProps } from '../types'
import { iconAssets } from '../../../static/iconBase64'

const ICON_SEARCH_EMPTY = iconAssets['static/icon/empty-search.png']

export const SearchResultsEmpty: React.FC<EmptyPlaceholderProps> = ({ keyword }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Image source={ICON_SEARCH_EMPTY} style={styles.icon} resizeMode="contain" />
      <Text style={styles.text}>{t('searchPlaceholder.noResults')}</Text>
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
  icon: {
    width: rpxToPx(200),
    height: rpxToPx(200),
  },
  text: {
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    marginTop: rpxToPx(28),
    fontWeight: '400',
    lineHeight: rpxToPx(40),
  },
})

export default SearchResultsEmpty
