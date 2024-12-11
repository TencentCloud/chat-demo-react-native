import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useConversationListContext } from '../../context/ConversationListContext';

export interface ConversationListHeaderProps {
  title?: string;
}

function UnMemoizedConversationListHeader(props: ConversationListHeaderProps) {
  const { setConversationCreateShow } = useConversationListContext();

  const { title = TUITranslateService.t('Conversation.TITLE') } = props;

  const toggleCreateConversationActions = () => {
    setConversationCreateShow(true);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerTitle}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          style={styles.conversationCreateAction}
          onPressIn={toggleCreateConversationActions}
        >
          <Image
            style={styles.createIcon}
            source={require('../../assets/create.png')}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  containerTitle: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#0000001A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    paddingHorizontal: 8,
    fontWeight: '600',
    fontSize: 34,
    lineHeight: 56,
    color: '#000000',
  },
  conversationCreateAction: {
    width: 40,
    height: 40,
    padding: 8,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIcon: {
    width: 20,
    height: 20,
  },
});

export const ConversationListHeader = React.memo(UnMemoizedConversationListHeader) as typeof UnMemoizedConversationListHeader;
