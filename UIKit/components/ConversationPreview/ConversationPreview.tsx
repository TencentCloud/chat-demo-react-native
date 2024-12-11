import React, { useEffect, useRef, useState } from 'react';
import TUIChatEngine, { type IConversationModel } from '@tencentcloud/chat-uikit-engine';

import { SwipeRow, type ISwipeRowRef } from '../SwipeRow';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';

import { ConversationActions, ConversationActionsType, type ConversationActionsProps } from '../ConversationActions';

import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { formatTime } from '../../utils';

export interface IConversationProps {
  conversation: IConversationModel;
  currentActivator?: IConversationModel;
  onPressConversation?: (conversation: IConversationModel) => void;
  onPressAction?: (conversation: IConversationModel, type: ConversationActionsType) => void;
  onTouchRight?: (conversation: IConversationModel) => void;
  Actions?: React.ComponentType<ConversationActionsProps>;
}

function UnMemoizedConversationPreview(props: IConversationProps) {
  const {
    conversation,
    currentActivator,
    onPressConversation: propsOnPressConversation,
    onTouchRight,
    onPressAction,
    Actions = ConversationActions,
  } = props;

  const SwipeRowRef = useRef<ISwipeRowRef>(null);

  const [badge, setBadge] = useState<string>('');

  const [hasMention, setHasMention] = useState<boolean>(false);

  const onPressRight = (type: ConversationActionsType) => {
    SwipeRowRef.current?.closeRow();
    onPressAction && onPressAction(conversation, type);
  };

  const onTouchStart = () => {
    onTouchRight && onTouchRight(conversation);
  };

  const onPressConversation = () => {
    propsOnPressConversation && propsOnPressConversation(conversation);
  };

  useEffect(() => {
    if (currentActivator !== conversation) {
      SwipeRowRef.current?.closeRow();
    }
  }, [currentActivator, conversation]);

  useEffect(() => {
    let newBadge = '';
    if (conversation.unreadCount > 0) {
      newBadge = `${conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}`;
    }
    const markUnRead = conversation.markList.some(item => item === TUIChatEngine.TYPES.CONV_MARK_TYPE_UNREAD);
    if (markUnRead) {
      newBadge = conversation.unreadCount > 0 ? newBadge : '1';
    }
    setBadge(newBadge);
    if (conversation.type === TUIChatEngine.TYPES.CONV_GROUP) {
      const flag = (conversation.groupAtInfoList && conversation.groupAtInfoList.length > 0) || false;
      setHasMention(flag);
    }
  }, [conversation]);

  const getLastMessage = () => {
    const text = conversation.getLastMessage('text') || '';
    if (conversation.type === TUIChatEngine.TYPES.CONV_GROUP) {
      if (text.match(/(.+):@/)) {
        return hasMention ? text.replace(/(.+):@/, ' @') : text.replace(/(.+):@/, '@');
      }
    }
    return text;
  };

  return (
    <SwipeRow
      ref={SwipeRowRef}
      rightContentWidth={136}
      rightContent={(
        <Actions
          conversation={conversation}
          onPress={onPressRight}
        />
      )}
      onTouchStart={onTouchStart}
    >
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={StyleSheet.flatten([styles.container, conversation?.isPinned && styles.pin])}
        onPress={onPressConversation}
      >
        <Avatar uri={conversation.getAvatar()} />
        <View style={styles.containerMain}>
          <View style={styles.containerContent}>
            <Text
              style={styles.title}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {conversation.getShowName()}
            </Text>
            <Text
              style={styles.description}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {hasMention && (
                <Text style={styles.mention}>{conversation.getGroupAtInfo()}</Text>
              )}
              {getLastMessage()}
            </Text>
          </View>
          <View style={styles.containerStatus}>
            {
              conversation.isMuted
                ? (
                    <Image
                      style={styles.icon}
                      source={require('../../assets/mute.png')}
                    />
                  )
                : (
                    badge && <Badge value={badge} containerStyle={styles.badge} />
                  )
            }
            <Text style={styles.time}>
              {formatTime(Number(conversation.lastMessage?.lastTime) * 1000, 'CONV', 12)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeRow>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  pin: {
    backgroundColor: '#7676801F',
  },
  containerMain: {
    flex: 1,
    flexDirection: 'row',
  },
  containerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  mention: {
    color: '#FF0000',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
  },
  containerStatus: {
    gap: 2,
    paddingLeft: 17,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  icon: {
    width: 15,
    height: 15,
  },
  badge: {
    paddingHorizontal: 5,
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export const ConversationPreview = React.memo(UnMemoizedConversationPreview) as typeof UnMemoizedConversationPreview;
