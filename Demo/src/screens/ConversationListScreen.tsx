import React, { useCallback, useMemo, useState } from 'react'
import { Image, type LayoutChangeEvent, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@tencentcloud/chat-uikit-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const ICON_ADD = require('./static/icon/add-circle.png')
const ICON_SEARCH = require('./static/icon/search.png')
const ICON_C2C = require('./static/icon/create-c2c.png')
const ICON_GROUP = require('./static/icon/create-group.png')
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { ConversationList, type ConversationInfo } from '@tencentcloud/chat-uikit-react-native'
import { rpxToPx } from '@tencentcloud/chat-uikit-react-native'
import { USER_PICKER_TYPE, type UserPickerType } from '@tencentcloud/chat-uikit-react-native'
import type { User } from '@tencentcloud/chat-uikit-react-native'

type RootStackParamList = {
  Login: undefined
  Main: undefined
  Chat: { conversationID: string; type: 'C2C' | 'GROUP'; title?: string; locateMessage?: any }
  UserPicker: { businessType: UserPickerType; routeParams?: Record<string, any> }
  Search: undefined
  ChatSetting: { conversationID: string; type: 'C2C' | 'GROUP' }
  CreateGroup: { selectedUsers?: User[] }
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>

const toMessageType = (raw: number | string | undefined): 'C2C' | 'GROUP' => {
  if (raw === 2) return 'GROUP'
  return 'C2C'
}


export const ConversationListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [showMenu, setShowMenu] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const handleNavbarLayout = useCallback((e: LayoutChangeEvent): void => {
    setNavbarHeight(e.nativeEvent.layout.height)
  }, [])
  const [rightIconRect, setRightIconRect] = useState<{ y: number; height: number } | null>(null)
  const handleRightIconLayout = useCallback((e: LayoutChangeEvent): void => {
    setRightIconRect({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })
  }, [])

  const handleBack = useCallback((): void => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }, [navigation])

  const handleMenuToggle = useCallback((): void => {
    setShowMenu((prev) => !prev)
  }, [])

  const handleMenuClose = useCallback((): void => {
    setShowMenu(false)
  }, [])

  const handleSearchTap = useCallback((): void => {
    navigation.navigate('Search')
  }, [navigation])

  const handleCreateC2CChat = useCallback((): void => {
    setShowMenu(false)
    navigation.navigate('UserPicker', {
      businessType: USER_PICKER_TYPE.C2C_CONVERSATION as UserPickerType,
      routeParams: {
        onNavigateToC2C: (conversationID: string): void => {
          navigation.replace('Chat', {
            conversationID,
            type: 'C2C',
            title: t('demo.screens.chat.title.default'),
          })
        },
      },
    })
  }, [navigation, t])

  const handleCreateGroupChat = useCallback((): void => {
    setShowMenu(false)
    navigation.navigate('UserPicker', {
      businessType: USER_PICKER_TYPE.CREATE_GROUP as UserPickerType,
      routeParams: {
        onNavigateToCreateGroup: (selectedUsers: { userID: string; nickname?: string; avatarURL?: string }[]): void => {
          navigation.replace('CreateGroup', { selectedUsers: selectedUsers as User[] })
        },
      },
    })
  }, [navigation])

  const handleConversationClick = useCallback(
    (conv: ConversationInfo): void => {
      navigation.navigate('Chat', {
        conversationID: conv.conversationID,
        type: toMessageType(conv.type as number),
        title: conv.title ?? conv.showName,
      })
    },
    [navigation]
  )

  const menuStyle = useMemo(() => {
    if (rightIconRect != null) {
      const iconBottom = insets.top + rightIconRect.y + rightIconRect.height
      return {
        top: iconBottom,
        right: rpxToPx(32),
      }
    }
    if (navbarHeight > 0) {
      return { top: navbarHeight + 8, right: rpxToPx(32) }
    }
    return { top: 0, right: rpxToPx(32) }
  }, [rightIconRect, navbarHeight, insets.top])

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <CustomNavbar
        title={t('demo.screens.conversationList.title')}
        onBack={handleBack}
        rightIcon={ICON_ADD}
        onRightPress={handleMenuToggle}
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
            <Text style={styles.searchEntryPlaceholder}>{t('demo.screens.conversationList.searchEntryPlaceholder')}</Text>
          </View>
        </TouchableOpacity>

        <ConversationList onConversationClick={handleConversationClick} />
      </View>

      {showMenu && (
        <Pressable style={styles.menuPopupMask} onPress={handleMenuClose}>
          <View style={[styles.menuPopupContent, menuStyle]}>
            <View style={styles.menuArrow} />
            <TouchableOpacity
              style={styles.menuItemWrapper}
              onPress={handleCreateC2CChat}
              activeOpacity={0.7}
            >
              <View style={styles.menuItem}>
                <Image source={ICON_C2C} style={styles.menuItemIcon} resizeMode="contain" />
                <Text style={styles.menuItemText}>{t('demo.screens.conversationList.menu.c2c')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItemWrapper}
              onPress={handleCreateGroupChat}
              activeOpacity={0.7}
            >
              <View style={styles.menuItem}>
                <Image source={ICON_GROUP} style={styles.menuItemIcon} resizeMode="contain" />
                <Text style={styles.menuItemText}>{t('demo.screens.conversationList.menu.createGroup')}</Text>
              </View>
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
  menuPopupMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuPopupContent: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(12),
    paddingVertical: rpxToPx(16),
    paddingHorizontal: rpxToPx(40),
    minWidth: rpxToPx(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rpxToPx(8) },
    shadowOpacity: 0.1,
    shadowRadius: rpxToPx(32),
    elevation: 8,
  },
  menuArrow: {
    position: 'absolute',
    top: -rpxToPx(8),
    right: rpxToPx(10),
    width: rpxToPx(16),
    height: rpxToPx(16),
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItemWrapper: {
    minHeight: rpxToPx(80),
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: rpxToPx(8),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: rpxToPx(40),
    height: rpxToPx(40),
    marginRight: rpxToPx(13),
  },
  menuItemText: {
    fontSize: rpxToPx(32),
    color: '#000000',
  },
})
