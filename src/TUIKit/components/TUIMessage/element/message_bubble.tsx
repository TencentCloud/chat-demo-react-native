import {ScreenWidth} from '@rneui/base';
import {Badge, Icon, makeStyles} from '@rneui/themed';
import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {MessageElemType, V2TimMessage} from 'react-native-tim-js';
import {SOUND_READ} from '../../../constants';
import {MessageSending} from './message_sending';
import {MessageToolTip} from './message_tooltip';

interface MessageBubbleProps {
  message: V2TimMessage;
  keyboardHeight?: number;
}

export const MessageBubble = <T extends MessageBubbleProps>(
  props: PropsWithChildren<T>,
) => {
  const {children, message, keyboardHeight} = props;
  const isSelf = message.isSelf ?? false;
  const styles = useStyles(isSelf);
  const isSoundElem =
    message.elemType === MessageElemType.V2TIM_ELEM_TYPE_SOUND;
  const showRedBadge =
    isSoundElem && !isSelf && message.localCustomInt !== SOUND_READ;
  const messageStatus = message.status;

  const getStyle = () => {
    const isAVMessage =
      message.elemType === MessageElemType.V2TIM_ELEM_TYPE_IMAGE ||
      message.elemType === MessageElemType.V2TIM_ELEM_TYPE_VIDEO;
    const isMergerMessage =
      message.elemType === MessageElemType.V2TIM_ELEM_TYPE_MERGER;
    if (isAVMessage) {
      return styles.imageContainer;
    }
    if (isMergerMessage) {
      return styles.mergerContainer;
    }
    const isFileMessage =
      message.elemType === MessageElemType.V2TIM_ELEM_TYPE_FILE;
    if (isFileMessage) {
      return styles.fileContainer;
    }
    return styles.container;
  };

  const getMessageStatus = (status: number) => {
    // 发送中
    if (status === 1) {
      return (
        <View style={styles.statusContainer}>
          <MessageSending />
        </View>
      );
    }
    if (status === 3) {
      return (
        <View style={styles.statusContainer}>
          <Icon name="error" size={18} color="red" />
        </View>
      );
    }
    return <View />;
  };

  return (
    <MessageToolTip message={message} keyboardHeight={keyboardHeight}>
      <View style={styles.bubbleContainer}>
        <View style={getStyle()}>{children}</View>
        {showRedBadge && (
          <Badge status="error" badgeStyle={styles.badgeStyle} />
        )}
        {isSelf && messageStatus && getMessageStatus(messageStatus)}
      </View>
    </MessageToolTip>
  );
};

export const composeKeyboardHeightWithMessageBubble = (height: number) => {
  return <T extends {message: V2TimMessage}>(props: PropsWithChildren<T>) => (
    <MessageBubble
      message={props.message}
      keyboardHeight={height}
      children={props.children}
    />
  );
};

const useStyles = makeStyles((theme, isSelf: boolean) => ({
  container: {
    borderTopLeftRadius: isSelf ? 10 : 2,
    borderTopRightRadius: isSelf ? 2 : 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: isSelf ? theme.colors.primary : theme.colors.secondary,
    color: theme.colors.black,
    maxWidth: ScreenWidth * 0.6,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: theme.colors.greyOutline,
    borderRadius: 10,
  },
  mergerContainer: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.greyOutline,
    borderTopLeftRadius: isSelf ? 10 : 2,
    borderTopRightRadius: isSelf ? 2 : 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  statusContainer: {
    marginRight: 6,
    marginBottom: 3,
  },
  fileContainer: {
    borderWidth: 1,
    borderColor: theme.colors.greyOutline,
    borderTopLeftRadius: isSelf ? 10 : 2,
    borderTopRightRadius: isSelf ? 2 : 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    color: theme.colors.black,
  },
  bubbleContainer: {
    display: 'flex',
    flexDirection: isSelf ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
  },
  badgeStyle: {
    marginLeft: 5,
    backgroundColor: '#FF584C',
    marginBottom: 12,
  },
}));
