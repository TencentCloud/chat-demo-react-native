import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import TUIChatEngine, { type IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { formatTime } from '../../../utils';

interface IMessageStatusProps {
  message: IMessageModel;
}

export const MessageStatus = (props: IMessageStatusProps) => {
  const { message } = props;
  const { flow, type, conversationType, status, isPeerRead = false } = message;
  const isImageAndVideo = (type === TUIChatEngine.TYPES.MSG_IMAGE || type === TUIChatEngine.TYPES.MSG_VIDEO);
  let style: Record<string, string | number> | null = null;
  let imageSource: any = '';
  if (conversationType === 'C2C' && isPeerRead) {
    style = styles.statusIcon;
    imageSource = require('../../../assets/msg-read.png');
  } else if (status === 'unSend') {
    style = styles.sending;
    imageSource = require('../../../assets/sending.png');
  } else if (status === 'success') {
    style = styles.statusIcon;
    imageSource = require('../../../assets/send-success.png');
  }

  return (
    <View
      style={[
        styles.messageStatusContainer,
        isImageAndVideo && styles.messageStatusContainerMedia,
      ]}
    >
      {(flow === 'out' && status !== 'fail') && (
        <Image
          style={style}
          source={imageSource}
        />
      )}
      <Text
        style={[
          styles.time,
          isImageAndVideo && styles.timeMedia,
        ]}
      >
        {formatTime(message.time * 1000, 'MSG', 12)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageStatusContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 'auto',
    paddingRight: 16,
    marginBottom: 8,
  },
  messageStatusContainerMedia: {
    position: 'absolute',
    bottom: 0,
  },
  time: {
    fontSize: 12,
    color: '#666666',
  },
  timeMedia: {
    color: '#FFFFFF',
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  sending: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
});
