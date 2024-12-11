import React, { PropsWithChildren, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import { TUIConversationService } from '@tencentcloud/chat-uikit-engine';

import {
  type ConversationListContentProps,
  ConversationListContent as DefaultConversationListContent,
} from '../ConversationListContent';
import {
  type ConversationListHeaderProps,
  ConversationListHeader as DefaultConversationListHeader,
} from '../ConversationListHeader';

import { ConversationCreate } from '../ConversationCreate';

import {
  ConversationListProvider,
  ConversationListProviderProps,
  useConversationListContext,
} from '../../context/ConversationListContext';

interface IConversationListProps extends ConversationListProviderProps {
  List?: React.ComponentType<ConversationListHeaderProps>;
  Header?: React.ComponentType<ConversationListContentProps>;
}

function ConversationListComponent(props: PropsWithChildren<IConversationListProps>) {
  const {
    children,
    List = DefaultConversationListContent,
    Header = DefaultConversationListHeader,
  } = props;

  const { conversationList } = useConversationListContext();

  useEffect(() => {
    TUIConversationService.switchConversation('');
  }, []);

  return (
    <>
      {children || (
        <View style={styles.conversationListContainer}>
          <Header />
          <List conversationList={conversationList} />
          <ConversationCreate />
        </View>
      )}
    </>
  );
}

function UnMemoizedConversationList(props: IConversationListProps): React.ReactElement {
  return (
    <ConversationListProvider {...props}>
      <ConversationListComponent {...props} />
    </ConversationListProvider>
  );
}

export const ConversationList = React.memo(UnMemoizedConversationList) as typeof UnMemoizedConversationList;

const styles = StyleSheet.create({
  conversationListContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
