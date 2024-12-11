import React, { Ref, forwardRef, useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';

import TUIChatEngine, { IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { TextElement } from '../TextElement';
import { FaceElement } from '../FaceElement';
import { ImageElement } from '../ImageElement';
import { VideoElement } from '../VideoElement';
import { FileElement } from '../FileElement';
import { VoiceElement } from '../VoiceElement';
import { CustomElement as DefaultCustomElement, type ICustomElementProps } from '../CustomElement';
import { MergeElement } from '../MergeElement';
import { MessageStatus } from '../MessageStatus';

import { useChatContext } from '../../../context';
import { isIOS } from '../../../utils';

interface IMessageContentProps {
  message: IMessageModel;
  isJoinedMessage?: boolean;
  CustomElement?: React.ComponentType<ICustomElementProps>;
  messageContentStyle?: ViewStyle;
}

export const MessageContent = forwardRef((props: IMessageContentProps, ref: Ref<View>) => {
  const {
    message,
    isJoinedMessage,
    CustomElement = _CustomElement || DefaultCustomElement,
    messageContentStyle,
  } = props;

  const [isQuotedMessageHighlight, setIsQuotedMessageHighlight] = useState<boolean>(false);

  const { CustomElement: _CustomElement, hightedMessageID, setHightedMessageID } = useChatContext();

  const flashAnimate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message.ID === hightedMessageID) {
      setIsQuotedMessageHighlight(true);
      flashAnimate && flashAnimation(flashAnimate);
    } else {
      setIsQuotedMessageHighlight(false);
    }
  }, [message, hightedMessageID]);

  const flashAnimation = (flashAnimateValue: any) => {
    let toValue = flashAnimateValue?._value === 12 ? 0 : 12;
    Animated.timing(flashAnimateValue, {
      toValue: toValue,
      duration: 2400,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setHightedMessageID('');
      }
    });
  };

  const isImageAndVideo = message.type === TUIChatEngine.TYPES.MSG_IMAGE || message.type === TUIChatEngine.TYPES.MSG_VIDEO;

  const computeMessageContentStyle = () => {
    let style: any = styles.messageContent;
    if (isIOS && message.type === TUIChatEngine.TYPES.MSG_TEXT) {
      style = StyleSheet.flatten([style, { minWidth: 120 }]);
    }
    if (message.type === TUIChatEngine.TYPES.MSG_FACE) {
      style = StyleSheet.flatten([style, styles.messageContentFace]);
    }
    if (isImageAndVideo) {
      style = StyleSheet.flatten([style, styles.messageContentImageAndVideo]);
    }
    if (message.flow === 'in') {
      style = StyleSheet.flatten([style, styles.messageContentIn]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.messageContentInJoined]);
      }
    } else {
      style = StyleSheet.flatten([style, styles.messageContentOut]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.messageContentOutJoined]);
      }
    }
    return style;
  };

  return (
    <View
      style={[computeMessageContentStyle(), messageContentStyle]}
      ref={ref}
    >
      {isQuotedMessageHighlight && (
        <Animated.View
          style={[computeMessageContentStyle(),
            styles.quoteMessageHighlighted,
            message.flow === 'in' ? styles.quoteMessageHighlightedIn : '',
            { opacity: flashAnimate?.interpolate({
              inputRange: [0, 2, 4, 6, 8, 10, 12],
              outputRange: [0, 0.6, 0, 0.6, 0, 0.6, 0],
            }) },
          ]}
        />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_TEXT && (
        <TextElement data={message.getMessageContent()} />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_FACE && (
        <FaceElement data={message.getMessageContent()} />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_IMAGE && (
        <ImageElement
          data={message.getMessageContent()}
          flow={message.flow}
          isJoinedMessage={isJoinedMessage}
        />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_VIDEO && (
        <VideoElement
          data={message.getMessageContent()}
          flow={message.flow}
          isJoinedMessage={isJoinedMessage}
        />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_FILE && (
        <FileElement data={message.getMessageContent()} />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_AUDIO && (
        <VoiceElement data="[Voice]" />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_CUSTOM && (
        <CustomElement data="[Custom Message]" />
      )}
      {message.type === TUIChatEngine.TYPES.MSG_MERGER && (
        <MergeElement data="[Chat History]" />
      )}
      <MessageStatus message={message} />
    </View>
  );
});

const styles = StyleSheet.create({
  messageContent: {
    position: 'relative',
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    borderColor: '#ECEBEB',
    borderWidth: 0.5,
    borderRadius: 16,
    minHeight: 33,
    backgroundColor: '#FFFFFF',
  },
  messageContentFace: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  messageContentImageAndVideo: {
    flexDirection: 'column',
  },
  messageContentRow: {
    flexDirection: 'row',
  },
  messageContentIn: {
    borderBottomLeftRadius: 0,
    marginLeft: 4,
  },
  messageContentInJoined: {
    borderBottomLeftRadius: 16,
  },
  messageContentOut: {
    borderWidth: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#F2F7FF',
  },
  messageContentOutJoined: {
    borderBottomRightRadius: 16,
  },
  quoteMessageHighlighted: {
    backgroundColor: '#ff9c19',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  quoteMessageHighlightedIn: {
    left: -4,
  },
});
