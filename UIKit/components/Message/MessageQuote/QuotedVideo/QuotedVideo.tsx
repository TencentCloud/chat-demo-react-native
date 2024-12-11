import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextStyle,
} from 'react-native';
import { IMessageModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { computeSkeletonSize } from '../../../../utils';

interface IQuotedVideoProps {
  originalMessage: IMessageModel | undefined;
  quotedTextStyle?: TextStyle;
  maxWidth: number;
}

export const QuotedVideo = (props: IQuotedVideoProps) => {
  const {
    originalMessage,
    quotedTextStyle,
    maxWidth,
  } = props;

  if (!originalMessage) {
    return (
      <Text style={quotedTextStyle}>
        {TUITranslateService.t('Chat.VIDEO')}
      </Text>
    );
  }
  const _messageContent = originalMessage.getMessageContent();

  let {
    snapshotWidth = 0,
    snapshotHeight = 0,
    snapshotUrl = 'https://web.sdk.qcloud.com/im/assets/images/transparent.png',
  } = _messageContent || {};

  const size = computeSkeletonSize(snapshotWidth, snapshotHeight, maxWidth, maxWidth);
  snapshotWidth = size.width;
  snapshotHeight = size.height;

  return (
    <View style={StyleSheet.flatten([{ width: snapshotWidth, height: snapshotHeight }, styles.videoElementContainer])}>
      <Image
        style={styles.videoElementSnapshot}
        source={{ uri: snapshotUrl }}
      />
      <Image
        style={styles.videoElementPlayIcon}
        source={require('../../../../assets/video-play.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoElementContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoElementSnapshot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoElementPlayIcon: {
    width: 10,
    height: 10,
  },
});
