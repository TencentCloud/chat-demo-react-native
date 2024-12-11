import React, { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import { useIsFocused, type ParamListBase, type RouteProp } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TUIChatEngine,
{
  IConversationModel,
  StoreName,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { ConversationListScreen } from '../UIKitScreen';
import { Setting as SettingScreen } from '../Setting';

interface ITabBar {
  default: ImageSourcePropType;
  focused: ImageSourcePropType;
}

interface IScreenOptionsProps {
  route: RouteProp<ParamListBase>;
}

interface ITabBarIconProps {
  focused: boolean;
}

export const Home = () => {
  const Tab = createBottomTabNavigator();
  const isFocused = useIsFocused();

  const menuList: Record<string, ITabBar> = {
    Message: {
      default: require('../../assets/conversation_normal.png'),
      focused: require('../../assets/conversation_selected.png'),
    },
    Setting: {
      default: require('../../assets/settings_normal.png'),
      focused: require('../../assets/settings_selected.png'),
    },
  };

  const [messageOptions, setMessageOptions] = useState<Record<string, any>>({});
  const [isPageShow, setIsPageShow] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [markCount, setMarkCount] = useState<number>(0);

  const onTotalUnreadCount = (value: number) => {
    setUnreadCount(value);
  };

  const onConversationListUpdated = (list: IConversationModel[]) => {
    const _markCount: number = list.reduce((accumulator: number, currentValue: IConversationModel) => {
      const markUnRead = currentValue.markList.some(item => item === TUIChatEngine.TYPES.CONV_MARK_TYPE_UNREAD);
      if (markUnRead && !currentValue.isMuted) {
        return accumulator + 1;
      }
      return accumulator + 0;
    }, 0);
    setMarkCount(_markCount);
  };

  useEffect(() => {
    const _messageOptions: Record<string, any> = {};
    const value = unreadCount + markCount;
    if (value > 0) {
      _messageOptions.tabBarBadge = `${value > 99 ? '99+' : value}`;
    }
    setMessageOptions(_messageOptions);
  }, [unreadCount, markCount]);

  useEffect(() => {
    TUIStore.watch(StoreName.CONV, {
      totalUnreadCount: onTotalUnreadCount,
      conversationList: onConversationListUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.CONV, {
        totalUnreadCount: onTotalUnreadCount,
      });
    };
  }, []);

  useEffect(() => {
    setIsPageShow(isFocused);
  }, [isFocused]);

  const screenOptions = ({ route }: IScreenOptionsProps) => {
    const tabBarIcon = ({ focused }: ITabBarIconProps) => {
      const icon = focused ? menuList[route.name].focused : menuList[route.name].default;
      return <Image source={icon} style={styles.icon} />;
    };
    return {
      tabBarIcon,
      headerShown: false,
      tabBarActiveTintColor: '#0365F9',
      tabBarInactiveTintColor: '#0365F9',
      tabBarStyle: styles.tabBarStyle,
      tabBarItemStyle: styles.tabBarItemStyle,
      tabBarLabelStyle: styles.tabBarLabelStyle,
      tabBarBadgeStyle: styles.tabBarBadgeStyle,
      animationEnabled: false,
      swipeEnabled: true,
    };
  };

  return isPageShow && (
    <Tab.Navigator
      screenOptions={screenOptions}
    >
      <Tab.Screen
        name="Message"
        component={ConversationListScreen}
        options={{
          title: TUITranslateService.t('Home.CHATS'),
          ...messageOptions,
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          title: TUITranslateService.t('Home.SETTING'),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  tabBarStyle: {
    paddingTop: 8,
    paddingBottom: 20,
    height: 70,
  },
  tabBarItemStyle: {
    gap: 3,
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  tabBarBadgeStyle: {
    top: -4,
  },
});
