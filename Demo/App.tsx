import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { UIKitProvider } from '@tencentcloud/chat-uikit-react-native';

import { Login as LoginScreen } from './pages/Login';
import { Language as LanguageScreen } from './pages/Language';
import { Home as HomeScreen } from './pages/Home';
import { About as AboutScreen } from './pages/About';
import { ChatScreen, ChatSettingScreen } from './pages/UIKitScreen';

import appResources from './i18n';
import uikitResources from '@tencentcloud/chat-uikit-react-native/i18n';

import { LoginUsingStorageInfo } from './initApp';

function App(): React.JSX.Element {
  const Stack = createNativeStackNavigator();
  const navigationRef = useNavigationContainerRef();
  // Init localization
  TUITranslateService.provideLanguages({
    'en-US': {
      ...appResources['en-US'],
      ...uikitResources['en-US'],
    },
    'zh-CN': {
      ...appResources['zh-CN'],
      ...uikitResources['zh-CN'],
    },
  });

  TUITranslateService.useI18n('en-US');
  useEffect(() => {
    LoginUsingStorageInfo(() => {
      navigationRef.navigate('Home');
    });
  });

  return (
    <UIKitProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
          />
          <Stack.Screen
            name="ChatSetting"
            component={ChatSettingScreen}
          />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{
              headerShown: true,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{
              headerShown: true,
              headerTitleAlign: 'center',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UIKitProvider>
  );
}

export default App;
