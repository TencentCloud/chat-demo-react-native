import React from 'react';

import { Chat } from '@tencentcloud/chat-uikit-react-native';
import { IRouterParams } from '../../../interface';

export const ChatScreen = ({ navigation }: IRouterParams) => {
  const navigateBack = () => {
    navigation.goBack();
  };
  const navigateToChatSetting = () => {
    navigation.navigate('ChatSetting');
  };

  return (
    <Chat
      navigateBack={navigateBack}
      navigateToChatSetting={navigateToChatSetting}
    />
  );
};
