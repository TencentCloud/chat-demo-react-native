import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./pages/home";
import LoginScreen from "./pages/login";
import { RootStackParamList } from "./interface";
import { MergerMessageScreen } from "./pages/merger_message_screen";
import { ChatScreen } from "./pages/chat";
import { Button } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Home"
          options={{
            headerShown:false
            // title: "消息",
            // headerBackVisible: false,
          }}
          component={HomeScreen}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          // options={{
          //   headerShadowVisible: true,
          //   headerBackTitleVisible: false,
          // }}
          name="Chat"
          component={ChatScreen}
        />
        <Stack.Screen
          name="MergerMessageScreen"
          options={{
            title: "聊天信息",
          }}
          component={MergerMessageScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
