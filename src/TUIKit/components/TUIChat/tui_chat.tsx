import {ThemeProvider} from '@rneui/themed';
import React, {Fragment, useCallback, useMemo, useRef, useState} from 'react';
import {Animated, findNodeHandle, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {V2TimMessage} from 'react-native-tim-js';
import {useMessageList} from '../../hooks/useMessageList';
import {TUIChatContextProvider} from '../../store';
import {tuiChatTheme} from '../../theme';
import {TUIChatHeader} from '../TUIChatHeader';
import {
  AudioElement,
  composeKeyboardHeightWithMessageBubble,
  CustomElement,
  FaceElement,
  FileElement,
  GroupTipsElement,
  ImageElement,
  LocationElement,
  ReplyElement,
  TextElement,
  TimeElement,
  VideoElement,
  withEditableRevokeMessage,
  withTapMergerElement,
} from '../TUIMessage/element';
import {withElement} from '../TUIMessage/tui_message';
import {
  TUIMessageInput,
  TUIMessageInputRef,
} from '../TUIMessageInput/tui_message_input';
import {TUIMessageList} from '../TUIMessageList';
import {
  KeyboardInsetsView,
  getEdgeInsetsForView,
} from 'react-native-keyboard-insets';
import {ViewDriver} from './driver/viewDriver';
import type {Driver} from './driver/driver';
import {KeyboardDriver} from './driver/keyboardDriver';
import {TUIMessageEmoji} from '../TUIMessageInput/tui_message_emoji';
import {TUIMessageToolBox} from '../TUIMessageInput/tui_message_tool_box';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {TUIChatProps} from '../../interface';
import {MessageAvatar} from '../TUIMessage/element/message_avatar';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const TUIChat = (props: TUIChatProps) => {
  const {
    conversation: {showName, faceUrl},
    showChatHeader,
    initialMessageList,
  } = props;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={tuiChatTheme}>
        <View style={styles.container}>
          {showChatHeader && (
            <TUIChatHeader title={showName} avatarUrl={faceUrl} />
          )}
          <TUIChatContextProvider initialMesage={initialMessageList}>
            <MessageViewWithInput {...props} />
          </TUIChatContextProvider>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const MessageViewWithInput = (props: TUIChatProps) => {
  // const { top } = useSafeAreaInsets();
  const {
    conversation,
    loginUserID,
    unMount,
    messageItemOption,
    textInputOption,
    onMergeMessageTap,
  } = props;
  const {loadMore} = useMessageList(conversation);
  const {userID, groupID, type} = conversation;
  const convID = type === 1 ? userID : groupID;
  const tuiMessageInputRef = useRef<TUIMessageInputRef>(null);
  const senderRef = useRef<View>(null);
  const [bottom, setBottom] = useState(25);
  const emoji = useRef(new ViewDriver('emoji')).current;
  const toolbox = useRef(new ViewDriver('toolbox')).current;
  const keyboard = useRef(new KeyboardDriver(tuiMessageInputRef)).current;
  const [driver, setDriver] = useState<Driver>();
  const [translateY, setTranslateY] = useState(new Animated.Value(0));
  const [translateMLY, setTranslateMLY] = useState(new Animated.Value(0));
  const driverState = {
    bottom,
    driver,
    setDriver,
    setTranslateY,
    setTranslateMLY,
  };

  const handleMessageEditable = useCallback((message: V2TimMessage) => {
    const text = message.textElem?.text;
    if (text) {
      tuiMessageInputRef.current?.addTextValue(text);
      tuiMessageInputRef.current?.getTextInputRef().current?.focus();
    }
  }, []);

  const handleMergeMessageTab = useCallback(
    (message: V2TimMessage) => {
      if (onMergeMessageTap) {
        onMergeMessageTap(message);
      }
    },
    [onMergeMessageTap],
  );

  const MessageElement = useMemo(
    () =>
      withElement({
        TextElement: messageItemOption?.TextElement ?? TextElement,
        MessageBubble:
          messageItemOption?.MessageBubble ??
          composeKeyboardHeightWithMessageBubble(336),
        TimeElement: messageItemOption?.TimeElement ?? TimeElement,
        ImageElement: messageItemOption?.ImageElement ?? ImageElement,
        AudioElement: messageItemOption?.AudioElement ?? AudioElement,
        FileElement: messageItemOption?.FileElement ?? FileElement,
        RevokeElement:
          messageItemOption?.RevokeElement ??
          withEditableRevokeMessage(handleMessageEditable),
        VideoElement: messageItemOption?.VideoElement ?? VideoElement,
        ReplyElement: messageItemOption?.ReplyElement ?? ReplyElement,
        CustomElement: messageItemOption?.CustomElement ?? CustomElement,
        FaceElement: messageItemOption?.FaceElement ?? FaceElement,
        LocationElement: messageItemOption?.LocationElement ?? LocationElement,
        GroupTipsElement:
          messageItemOption?.GroupTipsElement ?? GroupTipsElement,
        MergerElement:
          messageItemOption?.MergerElement ??
          withTapMergerElement(handleMergeMessageTab),
        MessageAvatar: messageItemOption?.MessageAvatar ?? MessageAvatar,
        showAvatar: messageItemOption?.showAvatar,
        showNickName: messageItemOption?.showNickName,
      }),
    [
      messageItemOption?.TextElement,
      messageItemOption?.MessageBubble,
      messageItemOption?.TimeElement,
      messageItemOption?.ImageElement,
      messageItemOption?.AudioElement,
      messageItemOption?.FileElement,
      messageItemOption?.RevokeElement,
      messageItemOption?.VideoElement,
      messageItemOption?.ReplyElement,
      messageItemOption?.CustomElement,
      messageItemOption?.FaceElement,
      messageItemOption?.LocationElement,
      messageItemOption?.GroupTipsElement,
      messageItemOption?.MergerElement,
      messageItemOption?.MessageAvatar,
      messageItemOption?.showAvatar,
      messageItemOption?.showNickName,
      handleMessageEditable,
      handleMergeMessageTab,
    ],
  );

  const onLoadMore = useCallback(
    (id: string) => {
      loadMore({
        userID,
        groupID,
        lastMsgID: id,
      });
    },
    [userID, groupID, loadMore],
  );

  const onLayout = useCallback(() => {
    const viewTag = findNodeHandle(senderRef.current);
    if (viewTag === null) {
      return;
    }

    getEdgeInsetsForView(viewTag, insets => {
      setBottom(insets.bottom!);
    });
  }, []);

  const onEmojiDelPress = useCallback(() => {
    tuiMessageInputRef.current?.deleteTextValue();
  }, []);

  const onEmojiSelect = useCallback((text: string) => {
    tuiMessageInputRef.current?.addTextValue(text);
  }, []);
  const onMessageSendPress = useCallback(() => {
    tuiMessageInputRef.current?.hanldeSubmiting();
  }, []);

  const mainStyle = {
    transform: [
      {
        translateY: translateY,
      },
    ],
  };

  const messageListContainerStyle = {
    transform: [
      {
        translateY: translateMLY,
      },
    ],
  };

  const viewNode = useRef<View | null>();

  const gesture = Gesture.Tap().onStart(() => {
    driver?.hide(driverState);
  });

  return (
    <Fragment>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.fill,
            messageListContainerStyle,
            {backgroundColor: 'white'},
          ]}
          ref={(ref: View | null | undefined) => (viewNode.current = ref)}
          onLayout={() => {
            viewNode.current?.measure((x, y, width, height) => {
              keyboard.onFillMessageLayout(height);
              emoji.onFillMessageLayout(height);
              toolbox.onFillMessageLayout(height);
            });
          }}>
          <TUIMessageList
            MessageElement={messageItemOption?.ItemComponent ?? MessageElement}
            onLoadMore={onLoadMore}
            unmount={unMount}
            onLayout={event => {
              emoji.onMessageListLayout(event);
              toolbox.onMessageListLayout(event);
              keyboard.onMessageListLayout(event);
            }}
            onScroll={() => {
              if (driver?.name === 'emoji') {
                emoji.shown && emoji.hide(driverState);
              } else {
                toolbox.shown && toolbox.hide(driverState);
              }
            }}
          />
        </Animated.View>
      </GestureDetector>
      <KeyboardInsetsView
        style={[mainStyle]}
        onKeyboard={keyboard.createCallback(driverState)}
        onLayout={onLayout}>
        <TUIMessageInput
          ref={tuiMessageInputRef}
          loginUserID={loginUserID}
          showFace={textInputOption?.showFace}
          showSound={textInputOption?.showSound}
          showToolBox={textInputOption?.showToolBox}
          convID={convID ?? ''}
          convType={type ?? 1}
          onEmojiTap={() => {
            emoji.toggle(driverState);
          }}
          driverName={driver?.name}
          onToolBoxTap={() => {
            toolbox.toggle(driverState);
          }}
          hideAllPanel={() => {
            if (driver?.name === 'emoji') {
              emoji.hide(driverState);
            } else {
              toolbox.hide(driverState);
            }
          }}
        />
      </KeyboardInsetsView>
      <TUIMessageToolBox
        loginUserID={loginUserID}
        convID={convID ?? ''}
        convType={type ?? 1}
        onLayout={toolbox.onLayout}
        style={toolbox.style}
      />
      <TUIMessageEmoji
        onEmojiDelPress={onEmojiDelPress}
        onEmojiSelect={onEmojiSelect}
        onMessageSendPress={onMessageSendPress}
        onLayout={emoji.onLayout}
        style={emoji.style}
      />
    </Fragment>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: ScreenWidth,
    height: ScreenHeight,
    backgroundColor: '#EDEDED',
  },
  fill: {
    flex: 1,
  },
});
