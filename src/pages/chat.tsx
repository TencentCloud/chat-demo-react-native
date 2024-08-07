import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js';
import {RootStackParamList} from '../interface';
import {TUIChat} from '../TUIKit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({route, navigation}: Props) {
  const {conversation, userID, unMount, initialMessageList} = route.params;
  useEffect(() => {
    navigation.setOptions({
      title: conversation.showName ?? '',
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: '#EDEDED',
      },
    });
  }, [conversation.showName, navigation]);

  const handleMergeMessageTap = (message: V2TimMessage) => {
    console.log('handleMergeMessageTap', message);
    navigation.navigate('MergerMessageScreen', {
      message,
    });
  };

  return (
    <SafeAreaProvider>
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TUIChat
        conversation={conversation}
        loginUserID={userID}
        showChatHeader={false}
        unMount={unMount}
        initialMessageList={initialMessageList}
        onMergeMessageTap={handleMergeMessageTap}
      />
    </View>
    </SafeAreaProvider>
  );
}
