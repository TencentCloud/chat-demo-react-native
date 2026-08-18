# @tencentcloud/chat-uikit-react-native

> **Build in-app chat, messaging, audio/video calls & live streaming in minutes.**
> A feature-rich React Native UI Kit for Tencent Cloud IM — **22 ready-to-use screens** (conversations, chat, friends, groups, search), full internationalization (i18n), and overseas-friendly design.

[![npm](https://img.shields.io/badge/npm-v3.0.0-blue)](https://www.npmjs.com/package/@tencentcloud/chat-uikit-react-native)
[![React Native](https://img.shields.io/badge/React%20Native-%3E%3D0.80-green)]()
[![Node](https://img.shields.io/badge/Node-%3E%3D22-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)]()
[![i18n](https://img.shields.io/badge/i18n-ready-orange)]()

---

## 📸 Screenshots

<p align="center">
  <img src="https://web.sdk.qcloud.com/im/assets/images/react_native_image.png" alt="Demo screenshot" />
</p>

---

## Before getting started
This section shows the prerequisites you need to check to use Chat UIKit for React-Native.

### Requirements
- React Native `>= 0.80`
- Node `>= 22`
- iOS `>= 16`
- Android `>= 24`

More details, please see https://reactnative.dev/docs/environment-setup

<br/>

## 🚀 Getting Start
This section gives you information you need to get started with Chat UIKit for React-Native.


### Step 1 — Create a project (Expo)

```bash
npx create-expo-app@latest my-app --template blank-typescript
cd my-app
```

### Step 2 — Install UIKit for React-Native

```bash
npx expo install @tencentcloud/chat-uikit-react-native tuikit-atomicx-react-native \
  react-i18next i18next \
  react-native-nitro-modules react-native-nitro-sound \
  react-native-video react-native-create-thumbnail \
  react-native-image-picker @react-native-documents/picker \
  @react-native-async-storage/async-storage \
  react-native-safe-area-context react-native-screens \
  @react-navigation/native @react-navigation/native-stack
```

> ⚠️ **Expo Go does not work** — this UIKit requires custom native modules (nitro, sound, video, etc.). Use **Expo prebuild** + a custom dev client.

### Step 3 — Prebuild & run

```bash
npx expo prebuild --clean
npx expo run:ios      # or: npx expo run:android
```

> For full integration steps (permission config, route mounting, login parameters), see the official documentation.

---

## Getting permissions

This UIKit requires **camera**, **microphone**, **storage/media**, and **network** permissions. Configure them **before** the first build.

Add the following to `app.json` under `expo`:

```jsonc
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to use your camera",
        "NSPhotoLibraryUsageDescription": "Allow $(PRODUCT_NAME) to access your photo library",
        "NSPhotoLibraryAddUsageDescription": "Allow $(PRODUCT_NAME) to save images to your library",
        "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to use your microphone",
        "NSDocumentsFolderUsageDescription": "Allow $(PRODUCT_NAME) to access your documents"
      }
    },
    "android": {
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_WIFI_STATE",
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO",
        "READ_MEDIA_AUDIO",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    }
  }
}
```

> **Note**: After adding permissions, run `npx expo prebuild --clean` to regenerate native projects with the new permissions.

---

## 🚀 Implementation guide

To help you get up and running with Chat UIKit more easily, we have provided convenient built-in screens to facilitate quick implementation.

> **Why copy `screens/` to local?** The 22 screens are the **view layer** — you'll almost always want to tweak them (your brand, your flow, your i18n strings). Keeping them in `node_modules` makes them read-only. Copy once, edit freely.

### Step 1 — Copy screens into your project

```bash
mkdir -p src/screens
cp -R node_modules/@tencentcloud/chat-uikit-react-native/src/screens/. src/screens/
```

### Step 2 — Wire up `App.tsx`

```tsx
import React, { useState } from 'react'
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {
  LoginScreen, ChatScreen, ChatSettingScreen,
  ConversationListScreen, ContactListScreen, SearchScreen,
  AddFriendScreen, AddGroupScreen, ApplicationVerifyScreen,
  BlackListScreen, ContactInfoScreen, FriendApplicationListScreen,
  GroupApplicationListScreen, GroupListScreen, SetRemarkScreen,
  GroupManagementScreen, GroupMemberListScreen, GroupTypeInfoScreen,
  CreateGroupScreen, SearchInConversationScreen, UserFilterScreen,
  UserPickerScreen, BottomTabBar, type BottomTabKey,
} from './src/screens'

import { ToastRoot } from '@tencentcloud/chat-uikit-react-native'

const Stack = createNativeStackNavigator()

const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('message')
  return (
    <View style={styles.mainScreen}>
      {activeTab === 'message' ? <ConversationListScreen /> : <ContactListScreen />}
      <BottomTabBar current={activeTab} onChange={setActiveTab} />
    </View>
  )
}

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark'
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ToastRoot />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="ChatSetting" component={ChatSettingScreen} />
          <Stack.Screen name="AddFriend" component={AddFriendScreen} />
          <Stack.Screen name="AddGroup" component={AddGroupScreen} />
          <Stack.Screen name="ApplicationVerify" component={ApplicationVerifyScreen} />
          <Stack.Screen name="BlackList" component={BlackListScreen} />
          <Stack.Screen name="ContactInfo" component={ContactInfoScreen} />
          <Stack.Screen name="FriendApplicationList" component={FriendApplicationListScreen} />
          <Stack.Screen name="GroupApplicationList" component={GroupApplicationListScreen} />
          <Stack.Screen name="GroupList" component={GroupListScreen} />
          <Stack.Screen name="SetRemark" component={SetRemarkScreen} />
          <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
          <Stack.Screen name="GroupMemberList" component={GroupMemberListScreen} />
          <Stack.Screen name="GroupTypeInfo" component={GroupTypeInfoScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="SearchInConversation" component={SearchInConversationScreen} />
          <Stack.Screen name="UserFilter" component={UserFilterScreen} />
          <Stack.Screen name="UserPicker" component={UserPickerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({ mainScreen: { flex: 1, backgroundColor: '#F5F5F5' } })
```

> **Before first login**, edit `src/screens/LoginScreen.tsx` and set your `SDKAppID` / `SecretKey`. 


## License

Copyright © 2026 Tencent. All rights reserved.
