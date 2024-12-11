import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import TUIChatEngine, { type IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../Avatar';
import { MessageContent } from './MessageContent';
import { MessageQuote } from './MessageQuote';
import { SendFail } from './SendFail';
import { MessageActions, type IMessagePosition } from '../MessageActions';

import { parseJSON } from '../../utils';

import type { ICustomElementProps } from './CustomElement';

import { useChatContext } from '../../context';

interface IMessageProps {
  message: IMessageModel;
  nextMessage: IMessageModel;
  CustomElement?: React.ComponentType<ICustomElementProps>;
}

export const Message = (props: IMessageProps) => {
  const {
    message,
    nextMessage,
    CustomElement,
  } = props;
  const [isShowMessageActions, setShowMessageActions] = useState<boolean>(false);
  const [currentMessagePosition, setCurrentMessagePosition] = useState<IMessagePosition>();
  const messageContentRef = useRef<View>(null);

  const { setImagePreviewVisible, setImagePreviewData } = useChatContext();

  //  message from the same user and within 5 min needs to join.
  let isJoinedMessage = false;

  if (nextMessage) {
    isJoinedMessage = (message.from === nextMessage.from && nextMessage.time - message.time <= 300);
  }

  const cloudCustomData = parseJSON(message?.cloudCustomData);
  const isQuotedMessage = Boolean(cloudCustomData?.messageReply);

  const onPressCurrentMessage = () => {
    if (message.type === TUIChatEngine.TYPES.MSG_IMAGE) {
      const data = message.getMessageContent();
      setImagePreviewVisible(true);
      setImagePreviewData(data);
    }
  };

  const longPressCurrentMessage = () => {
    if (message.status !== 'success') {
      return;
    }
    if (messageContentRef.current) {
      messageContentRef.current.measureInWindow(
        (pageX: number, pageY: number, width: number, height: number) => {
          setShowMessageActions(true);
          setCurrentMessagePosition({ x: pageX, y: pageY, width, height });
        },
      );
    }
  };

  const onCloseMessageAction = () => {
    setShowMessageActions(false);
  };

  const renderAvatarOrPlaceholder = () => {
    if (message.flow === 'in') {
      return !isJoinedMessage
        ? (<Avatar size={32} uri={message.avatar} styles={styles.avatarBox} />)
        : (<View style={styles.emptyView} />);
    }
    return null;
  };

  return (
    <>
      <View
        style={[
          styles.messageContainer,
          message.flow === 'in' ? styles.messageIn : styles.messageOut,
          isJoinedMessage && styles.messageContainerJoined,
          isQuotedMessage && styles.messageContainerQuoted,
        ]}
      >
        <View style={styles.messageBox}>
          {renderAvatarOrPlaceholder()}
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={onPressCurrentMessage}
            onLongPress={longPressCurrentMessage}
          >
            <MessageContent
              ref={messageContentRef}
              message={message}
              isJoinedMessage={isJoinedMessage}
              CustomElement={CustomElement}
            />
          </TouchableOpacity>
        </View>
        <SendFail message={message} />
      </View>
      {isQuotedMessage && <MessageQuote message={message} isJoinedMessage={isJoinedMessage} />}
      <MessageActions
        visible={isShowMessageActions}
        message={message}
        onCloseMessageAction={onCloseMessageAction}
        messagePosition={currentMessagePosition}
      />
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageContainerJoined: {
    marginBottom: 2,
  },
  messageContainerQuoted: {
    marginBottom: 0,
  },
  messageBox: {
    flexDirection: 'row',
  },
  messageIn: {
    paddingRight: 70,
    marginRight: 20,
  },
  messageOut: {
    paddingLeft: 92,
    justifyContent: 'flex-end',
  },
  emptyView: {
    width: 32,
    height: 32,
  },
  avatarBox: {
    alignSelf: 'flex-end',
  },
});
