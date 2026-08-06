import type { NavigationProp, RouteProp } from '@react-navigation/native'

export interface RootStackParamList {
  ConversationList: undefined
  MessageList: { conversationID: string; conversationType?: 'C2C' | 'GROUP' }
  ChatSetting: { conversationID: string; conversationType: 'C2C' | 'GROUP' }
  ContactList: undefined
  ContactInfo: { userID: string; type: 'friend' | 'group' | 'stranger' }
  GroupList: undefined
  Search: { defaultTab?: 'message' | 'conversation' | 'user' | 'group' }
  UserPicker: {
    mode: 'multi' | 'single'
    excludedUserIDs?: string[]
    maxCount?: number
  }
  CreateGroup: undefined
  [key: string]: any
}

export type AppNavigation = NavigationProp<RootStackParamList>

export type AppRoute<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>

export interface NavigationLike {
  navigate: (screen: string, params?: Record<string, any>) => void
  goBack: () => void
  setOptions?: (options: any) => void
  addListener?: (event: string, callback: (...args: any[]) => void) => () => void
}

let _warned = false
export const safeNavigate = (
  navigation: NavigationLike | undefined,
  screen: string,
  params?: Record<string, any>
): void => {
  if (!navigation || typeof navigation.navigate !== 'function') {
    if (!_warned) {
      console.warn(
        `[chat-uikit-react-native] navigation prop is missing — cannot navigate to "${screen}". ` +
          'Host app must provide navigation prop (e.g. via react-navigation).'
      )
      _warned = true
    }
    return
  }
  navigation.navigate(screen, params)
}
