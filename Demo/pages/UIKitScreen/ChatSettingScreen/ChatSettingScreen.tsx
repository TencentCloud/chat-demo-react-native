import React from 'react';

import { ChatSetting } from '@tencentcloud/chat-uikit-react-native';
import { IRouterParams } from '../../../interface';

export const ChatSettingScreen = ({ navigation }: IRouterParams) => {
  const navigateBack = () => {
    navigation.goBack();
  };

  const navigateToConversationList = () => {
    navigation.navigate('Home');
  };

  return (
    <ChatSetting
      navigateBack={navigateBack}
      navigateToChat={navigateBack}
      navigateToConversationList={navigateToConversationList}
    />
  );
};
