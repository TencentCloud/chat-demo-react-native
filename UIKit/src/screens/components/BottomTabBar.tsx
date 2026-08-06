import React, { useMemo } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@tencentcloud/chat-uikit-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'

const TAB_MESSAGE_DEFAULT = require('../static/message.png')
const TAB_MESSAGE_SELECTED = require('../static/message-selected.png')
const TAB_RELATION_DEFAULT = require('../static/relation.png')
const TAB_RELATION_SELECTED = require('../static/relation-selected.png')

export type BottomTabKey = 'message' | 'relation'

export interface BottomTabBarProps {
  current: BottomTabKey
  onChange: (tab: BottomTabKey) => void
}

interface BottomTabItemConfig {
  key: BottomTabKey
  defaultIcon: any
  selectedIcon: any
  label: string
}

const TAB_ITEM_KEYS: { key: BottomTabKey; defaultIcon: any; selectedIcon: any }[] = [
  {
    key: 'message',
    defaultIcon: TAB_MESSAGE_DEFAULT,
    selectedIcon: TAB_MESSAGE_SELECTED,
  },
  {
    key: 'relation',
    defaultIcon: TAB_RELATION_DEFAULT,
    selectedIcon: TAB_RELATION_SELECTED,
  },
]

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ current, onChange }) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const tabItems = useMemo<BottomTabItemConfig[]>(() => [
    { ...TAB_ITEM_KEYS[0], label: t('demo.tabBar.message') },
    { ...TAB_ITEM_KEYS[1], label: t('demo.tabBar.relation') },
  ], [t])
  const handleTabPress = (tab: BottomTabItemConfig): void => {
    if (tab.key === current) return
    onChange(tab.key)
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom}]}>
      {tabItems.map((tab) => {
        const isActive = tab.key === current
        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={(): void => handleTabPress(tab)}
          >
            <Image
              source={isActive ? tab.selectedIcon : tab.defaultIcon}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const ICON_SIZE = 28
const LABEL_FONT_SIZE = 11
const ACTIVE_COLOR = '#1F66FF'
const INACTIVE_COLOR = '#7A7E83'
const BORDER_COLOR = '#E5E7EB'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: rpxToPx(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_COLOR,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: rpxToPx(ICON_SIZE * 2),  // 28pt * 2 = 56rpx
    height: rpxToPx(ICON_SIZE * 2),
  },
  label: {
    fontSize: rpxToPx(LABEL_FONT_SIZE * 2),  // 11pt * 2 = 22rpx
    color: INACTIVE_COLOR,
    marginTop: rpxToPx(4),
  },
  labelActive: {
    color: ACTIVE_COLOR,
  },
})

export default BottomTabBar
