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

interface IQuotedImageProps {
  originalMessage: IMessageModel | undefined;
  quotedTextStyle?: TextStyle;
  maxWidth: number;
}

export const QuotedImage = (props: IQuotedImageProps) => {
  const {
    originalMessage,
    quotedTextStyle,
    maxWidth = 0,
  } = props;

  if (!originalMessage) {
    return (
      <Text style={quotedTextStyle}>
        {TUITranslateService.t('Chat.IMAGE')}
      </Text>
    );
  }

  const _messageContent = originalMessage.getMessageContent();

  let { width, height, url } = _messageContent;

  const size = computeSkeletonSize(width, height, maxWidth, maxWidth);
  width = size.width;
  height = size.height;

  return (
    <View style={{ width, height }}>
      <Image
        style={styles.imageContainer}
        resizeMode="contain"
        source={{ uri: url }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
  },
});
