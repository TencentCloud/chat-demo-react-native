import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';

import chatEngine, { IConversationModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

export enum ConversationActionsType {
  MORE = 'more',
  MARK_UNREAD = 'unread',
  MARK_READ = 'read',
}

export interface ConversationActionsProps {
  conversation: IConversationModel;
  onPress?: (type: ConversationActionsType) => void;
}

export interface IActionItem {
  key: ConversationActionsType;
  name: string;
  isShow: boolean;
  style: ViewStyle;
  icon: ImageSourcePropType;
}

function UnMemoizedConversationActionsPreview(props: ConversationActionsProps) {
  const {
    conversation,
    onPress,
  } = props;

  const actionList = useCallback((): IActionItem[] => {
    const isMarkUnRead: boolean = conversation.markList.some(item => item === chatEngine.TYPES.CONV_MARK_TYPE_UNREAD);
    const isShowRead = isMarkUnRead || conversation.unreadCount > 0;
    return [
      {
        key: ConversationActionsType.MORE,
        name: TUITranslateService.t('Conversation.MORE'),
        isShow: true,
        style: styles.more,
        icon: require('../../assets/more.png'),
      },
      {
        key: ConversationActionsType.MARK_READ,
        name: TUITranslateService.t('Conversation.MARK_READ'),
        isShow: isShowRead,
        style: styles.read,
        icon: require('../../assets/read.png'),
      },
      {
        key: ConversationActionsType.MARK_UNREAD,
        name: TUITranslateService.t('Conversation.MARK_UNREAD'),
        isShow: !isShowRead,
        style: styles.unread,
        icon: require('../../assets/unread.png'),
      },
    ];
  }, [conversation]);

  const _onPress = (item: IActionItem) => {
    onPress && onPress(item.key);
  };

  return (
    <View style={styles.container}>
      {
        actionList().map((item: IActionItem) => item.isShow && (
          <TouchableOpacity
            key={item.key}
            activeOpacity={1}
            style={StyleSheet.flatten([
              styles.flexBase,
              item.style,
            ])}
            onPress={() => { _onPress(item); }}
          >
            <Image
              style={styles.icon}
              source={item.icon}
            />
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 136,
    flexDirection: 'row',
  },
  flexBase: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  more: {
    backgroundColor: '#000000',
  },
  read: {
    backgroundColor: '#0365F9',
  },
  unread: {
    backgroundColor: '#7A7A7A',
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
  },
  icon: {
    width: 18,
    height: 18,
  },
});

export const ConversationActions = React.memo(UnMemoizedConversationActionsPreview) as typeof UnMemoizedConversationActionsPreview;
