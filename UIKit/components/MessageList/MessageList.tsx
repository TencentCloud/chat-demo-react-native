import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import TUIChatEngine, { type IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { Message } from '../Message';
import { GroupTipElement } from '../Message/GroupTipElement';
import { MessageRecall } from '../Message/MessageRecall';
import { Timeline } from './Timeline';

import { useChatContext } from '../../context';

import { isSameDay, isIOS, isIOSMini } from '../../utils';
import { PreviewImage } from '../PreviewImage';

export interface IMessageListProps {
  messageList?: IMessageModel[];
  loadMoreMessage?: () => void;
}

interface IFlatItemProps {
  message: IMessageModel;
  prevMessage: IMessageModel;
  nextMessage: IMessageModel;
}

const FlatItem = (props: IFlatItemProps) => {
  const {
    message,
    prevMessage,
    nextMessage,
  } = props;

  let isNeededTimeline = true;
  if (prevMessage) {
    isNeededTimeline = !isSameDay(prevMessage.time * 1000, message.time * 1000);
  }

  return (
    <>
      {isNeededTimeline && (<Timeline message={message} />)}
      {message.type === TUIChatEngine.TYPES.MSG_GRP_TIP && (
        <GroupTipElement data={message.getMessageContent()} />
      )}
      {message.isRevoked && (<MessageRecall message={message} />)}
      {(message.type !== TUIChatEngine.TYPES.MSG_GRP_TIP && !message.isRevoked) && (
        <Message
          message={message}
          nextMessage={nextMessage}
        />
      )}
    </>
  );
};

export const MessageList = (props?: IMessageListProps) => {
  const messageListRef = useRef<FlatList<any> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRefNewMsg = useRef<NodeJS.Timeout | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(300);

  const {
    messageList: defaultMessageList,
    loadMoreMessage: defaultLoadMoreMessage,
    scrollToBottomDefault,
    textInputFocused,
    textInputBlured,
    emojiPanelOpened,
    refreshing,
    setTextInputBlured,
    setEmojiPanelOpened,
    setScrollToBottomDefault,
    receivedNewMessage,
    setMessageListRef,
  } = useChatContext();

  const {
    messageList = defaultMessageList,
    loadMoreMessage = defaultLoadMoreMessage,
  } = props;

  useEffect(() => {
    if (messageListRef?.current) {
      setMessageListRef(messageListRef);
    }
    if (scrollToBottomDefault || textInputFocused || textInputBlured || emojiPanelOpened) {
      timerRef.current = setTimeout(() => {
        messageListRef?.current?.scrollToEnd({ animated: true });
        timerRef.current && clearTimeout(timerRef.current);
      }, 800);
    }

    if (receivedNewMessage) {
      setScrollToBottomDefault(false);
      timerRefNewMsg.current = setTimeout(() => {
        messageListRef?.current?.scrollToEnd({ animated: true });
        timerRefNewMsg.current && clearTimeout(timerRefNewMsg.current);
      }, 100);
    }

    let keyboardDidShowListener: any = null;
    if (isIOS) {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        keyboardDidShowListener.remove();
      });
    }
    return () => {
      if (keyboardDidShowListener) {
        keyboardDidShowListener.remove();
      }
    };
  }, [
    messageList,
    scrollToBottomDefault,
    textInputFocused,
    textInputBlured,
    emojiPanelOpened,
    setScrollToBottomDefault,
    receivedNewMessage,
    setMessageListRef,
  ]);

  const onScrollBeginDrag = () => {
    setTextInputBlured(false);
    setEmojiPanelOpened(false);
  };

  const computeMessageListContainerStyle = () => {
    let paddingBottom = 100; // default 100 for android
    if (isIOS) {
      paddingBottom = isIOSMini ? 120 : 180;
      if (emojiPanelOpened) {
        paddingBottom = isIOSMini ? 320 : 380;
      }
      if (textInputFocused) {
        paddingBottom = isIOSMini ? keyboardHeight + 120 : keyboardHeight + 150;
      }
    } else {
      if (emojiPanelOpened) {
        paddingBottom = 300;
      }
    }
    return StyleSheet.flatten([styles.messageListContainer, { paddingBottom }]);
  };

  return (
    <View style={computeMessageListContainerStyle()}>
      <TouchableWithoutFeedback onPressIn={Keyboard.dismiss}>
        <FlatList
          ref={messageListRef}
          data={messageList}
          renderItem={({ item, index }) => (
            <FlatItem
              message={item}
              prevMessage={messageList[index - 1]}
              nextMessage={messageList[index + 1]}
            />
          )}
          keyExtractor={item => item.ID}
          showsVerticalScrollIndicator={false}
          refreshControl={(
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { loadMoreMessage(); }}
            />
          )}
          onScrollBeginDrag={onScrollBeginDrag}
        />
      </TouchableWithoutFeedback>
      <PreviewImage />
    </View>
  );
};

const styles = StyleSheet.create({
  messageListContainer: {
    height: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
});
