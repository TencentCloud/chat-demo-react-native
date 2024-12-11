import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';

import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';

import { Header } from './Header';
import { GroupSetting } from './GroupSetting';

interface IChatSettingProps {
  navigateBack?: () => void;
  navigateToChat?: () => void;
  navigateToConversationList?: () => void;
}

function UnMemoizedChatSetting(props: IChatSettingProps): React.ReactElement {
  const { navigateBack, navigateToChat, navigateToConversationList } = props;
  const [currentConversation, setCurrentConversation] = useState<IConversationModel>();

  useEffect(() => {
    const conversation = TUIStore.getData(StoreName.CONV, 'currentConversation');
    setCurrentConversation(conversation);
  }, []);

  return (
    <SafeAreaView style={styles.chatSettingContainer}>
      <Header
        title={TUITranslateService.t('ChatSetting.GROUP_DETAILS')}
        navigateBack={navigateBack}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {currentConversation?.type === TUIChatEngine.TYPES.CONV_GROUP && (
          <GroupSetting
            navigateToChat={navigateToChat}
            navigateToConversationList={navigateToConversationList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatSettingContainer: {
    backgroundColor: '#FFFFFF',
  },
});

export const ChatSetting = React.memo(UnMemoizedChatSetting) as typeof UnMemoizedChatSetting;
