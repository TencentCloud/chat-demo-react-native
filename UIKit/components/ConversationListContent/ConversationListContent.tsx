import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';

import { ConversationPreview, IConversationProps } from '../ConversationPreview';
import type { IConversationModel } from '@tencentcloud/chat-uikit-engine';
import { useConversationListContext } from '../../context';
import { ConversationActionsModel, ConversationActionsType } from '../ConversationActions';

export interface ConversationListContentProps {
  conversationList?: IConversationModel[];
  Conversation?: React.ComponentType<IConversationProps>;
}

function UnMemoizedConversationListContent(props: ConversationListContentProps) {
  const [showActionMore, setShowActionMore] = React.useState<boolean>(false);

  const {
    conversationList = [],
    Conversation = ConversationPreview,
  } = props;

  const {
    currentActivator,
    setCurrentActivator,
    onPressConversation,
    markConversationUnread,
    setMessageRead,
    setCurrentConversation,
  } = useConversationListContext();

  const onTouchRight = (conversation: IConversationModel) => {
    if (currentActivator !== conversation) {
      setCurrentActivator && setCurrentActivator(conversation);
    }
  };

  const onPress = (conversation: IConversationModel) => {
    setCurrentConversation(conversation);
    onPressConversation && onPressConversation(conversation);
  };

  const handleMarkConversationUnread = (conversation: IConversationModel) => {
    if (conversation.unreadCount > 0) {
      setMessageRead(conversation);
    }
    markConversationUnread(conversation, false);
  };

  const onPressAction = (conversation: IConversationModel, type: ConversationActionsType) => {
    switch (type) {
      case ConversationActionsType.MARK_UNREAD:
        markConversationUnread(conversation);
        break;
      case ConversationActionsType.MARK_READ:
        handleMarkConversationUnread(conversation);
        break;
      default:
        setShowActionMore(true);
        break;
    }
  };

  const closeActionsModel = () => {
    setShowActionMore(false);
    setCurrentActivator(undefined);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversationList}
        renderItem={({ item }) => (
          <Conversation
            conversation={item}
            currentActivator={currentActivator}
            onPressConversation={onPress}
            onPressAction={onPressAction}
            onTouchRight={onTouchRight}
          />
        )}
        keyExtractor={item => item.conversationID}
        showsVerticalScrollIndicator={false}
      />
      <ConversationActionsModel
        isShow={showActionMore}
        conversation={currentActivator}
        onClose={closeActionsModel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export const ConversationListContent = React.memo(UnMemoizedConversationListContent) as typeof UnMemoizedConversationListContent;
