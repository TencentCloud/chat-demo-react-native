import React, { useCallback, useMemo, useState } from 'react'
import { Image, type LayoutChangeEvent, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@tencentcloud/chat-uikit-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { ContactList, type EntryType } from '@tencentcloud/chat-uikit-react-native'
import type { ContactInfoData } from '@tencentcloud/chat-uikit-react-native'
import { rpxToPx } from '@tencentcloud/chat-uikit-react-native'

const ICON_ADD = require('./static/icon/add-circle.png')
const ICON_ADD_FRIEND = require('./static/icon/new-contacts.png')
const ICON_ADD_GROUP = require('./static/icon/groups.png')
const ICON_SEARCH = require('./static/icon/search.png')

type RootStackParamList = {
  ContactList: undefined
  ChatSetting: { conversationID: string; type: 'C2C' | 'GROUP' }
  Chat: { conversationID: string; type: 'C2C' | 'GROUP'; title?: string; locateMessage?: any }
  Search: undefined
  ContactInfo: { type: 'friend' | 'addFriend' | 'newContact'; friendInfo?: any; userInfo?: any; applicationInfo?: any }
  AddFriend: undefined
  AddGroup: undefined
  FriendApplicationList: undefined
  GroupApplicationList: undefined
  GroupList: undefined
  BlackList: undefined
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'ContactList'>


export const ContactListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const handleNavbarLayout = useCallback((e: LayoutChangeEvent): void => {
    setNavbarHeight(e.nativeEvent.layout.height)
  }, [])
  const [rightIconRect, setRightIconRect] = useState<{ y: number; height: number } | null>(null)
  const handleRightIconLayout = useCallback((e: LayoutChangeEvent): void => {
    setRightIconRect({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })
  }, [])

  const handleBack = useCallback((): void => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] })
  }, [navigation])

  const handleMenuClick = useCallback((): void => {
    setShowAddMenu((prev) => !prev)
  }, [])

  const closeAddMenu = useCallback((): void => {
    setShowAddMenu(false)
  }, [])

  const handleAddFriend = useCallback((): void => {
    closeAddMenu()
    navigation.navigate('AddFriend')
  }, [navigation])

  const handleAddGroup = useCallback((): void => {
    closeAddMenu()
    navigation.navigate('AddGroup')
  }, [navigation])

  const handleEntryClick = useCallback(
    (entryType: EntryType): void => {
      switch (entryType) {
        case 'newContact':
          navigation.navigate('FriendApplicationList')
          break
        case 'groupNotification':
          navigation.navigate('GroupApplicationList')
          break
        case 'myGroups':
          navigation.navigate('GroupList')
          break
        case 'blacklist':
          navigation.navigate('BlackList')
          break
      }
    },
    [navigation]
  )
  const handleContactSelect = useCallback(
    (contact: ContactInfoData): void => {
      navigation.navigate('ContactInfo', { type: 'friend', friendInfo: contact })
    },
    [navigation]
  )

  const handleSearchTap = useCallback((): void => {
    navigation.navigate('Search')
  }, [navigation])

  const menuStyle = useMemo(() => {
    if (rightIconRect != null) {
      const iconBottom = insets.top + rightIconRect.y + rightIconRect.height
      return {
        top: iconBottom,
      }
    }
    if (navbarHeight > 0) {
      return { top: navbarHeight + 8 }
    }
    return { top: 0 }
  }, [rightIconRect, navbarHeight, insets.top])

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <CustomNavbar
        title={t('demo.screens.contactList.title')}
        onBack={handleBack}
        rightIcon={ICON_ADD}
        onRightPress={handleMenuClick}
        onLayout={handleNavbarLayout}
        onRightIconLayout={handleRightIconLayout}
      />

      <View style={styles.pageContent}>
        <TouchableOpacity
          style={styles.searchEntry}
          onPress={handleSearchTap}
          activeOpacity={0.7}
        >
          <View style={styles.searchEntryInner}>
            <Image source={ICON_SEARCH} style={styles.searchEntryIcon} resizeMode="contain" />
            <Text style={styles.searchEntryPlaceholder}>{t('demo.screens.contactList.searchEntryPlaceholder')}</Text>
          </View>
        </TouchableOpacity>

        <ContactList
          onContactSelect={handleContactSelect}
          onEntryClick={handleEntryClick}
        />
      </View>

      {showAddMenu && (
        <Pressable style={styles.addMenuMask} onPress={closeAddMenu}>
          <View style={[styles.addMenuPopup, menuStyle]}>
            <View style={styles.addMenuArrow} />
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={handleAddFriend}
              activeOpacity={0.7}
            >
              <Image source={ICON_ADD_FRIEND} style={styles.addMenuItemIcon} resizeMode="contain" />
              <Text style={styles.addMenuItemText}>{t('demo.screens.contactList.menu.addFriend')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={handleAddGroup}
              activeOpacity={0.7}
            >
              <Image source={ICON_ADD_GROUP} style={styles.addMenuItemIcon} resizeMode="contain" />
              <Text style={styles.addMenuItemText}>{t('demo.screens.contactList.menu.addGroup')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  pageContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  searchEntry: {
    backgroundColor: '#FFFFFF',
    padding: rpxToPx(32),
  },
  searchEntryInner: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F7',
    borderRadius: rpxToPx(8),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rpxToPx(20),
  },
  searchEntryIcon: {
    width: rpxToPx(30),
    height: rpxToPx(30),
    marginRight: rpxToPx(5),
  },
  searchEntryPlaceholder: {
    fontSize: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.4)',
  },

  addMenuMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  addMenuPopup: {
    position: 'absolute',
    top: 0,
    right: rpxToPx(18),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(14),
    paddingVertical: rpxToPx(15),
    paddingHorizontal: rpxToPx(37),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  addMenuArrow: {
    position: 'absolute',
    top: -rpxToPx(12),
    right: rpxToPx(22),
    width: rpxToPx(24),
    height: rpxToPx(24),
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(15),
  },
  addMenuItemIcon: {
    width: rpxToPx(36),
    height: rpxToPx(36),
  },
  addMenuItemText: {
    paddingLeft: rpxToPx(26),
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(45),
    color: '#444444',
  },
})
