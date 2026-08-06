import React, { useState } from 'react'
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  LoginScreen,
  ChatScreen,
  ChatSettingScreen,
  ConversationListScreen,
  ContactListScreen,
  SearchScreen,
  AddFriendScreen,
  AddGroupScreen,
  ApplicationVerifyScreen,
  BlackListScreen,
  ContactInfoScreen,
  FriendApplicationListScreen,
  GroupApplicationListScreen,
  GroupListScreen,
  SetRemarkScreen,
  GroupManagementScreen,
  GroupMemberListScreen,
  GroupTypeInfoScreen,
  CreateGroupScreen,
  SearchInConversationScreen,
  UserFilterScreen,
  UserPickerScreen,
  BottomTabBar,
  type BottomTabKey,
} from './src/screens'

import { ToastRoot } from '@tencentcloud/chat-uikit-react-native'

const Stack = createNativeStackNavigator()

const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('message')
  return (
    <View style={styles.mainScreen}>
      {activeTab === 'message' ? (
        <ConversationListScreen />
      ) : (
        <ContactListScreen />
      )}
      <BottomTabBar current={activeTab} onChange={setActiveTab} />
    </View>
  )
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ToastRoot />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainScreen} options={{ freezeOnBlur: true }} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="ChatSetting" component={ChatSettingScreen} options={{ freezeOnBlur: true }} />
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

const styles = StyleSheet.create({
  mainScreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
})

export default App
