import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextStyle,
} from 'react-native';
import { IMessageModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

interface IQuotedFileProps {
  originalMessage: IMessageModel | undefined;
  quotedTextStyle?: TextStyle;
}

export const QuotedFile = (props: IQuotedFileProps) => {
  const {
    originalMessage,
    quotedTextStyle,
  } = props;

  if (!originalMessage) {
    return (
      <Text style={quotedTextStyle}>
        {TUITranslateService.t('Chat.FILE')}
      </Text>
    );
  }

  const _messageContent = originalMessage.getMessageContent();

  return (
    <View style={styles.fileElementContainer}>
      <Image
        style={styles.fileIcon}
        source={require('../../../../assets/msg-file-icon.png')}
      />
      <Text
        style={styles.fileName}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {_messageContent.name}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  fileElementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  fileName: {
    flexShrink: 1,
    maxWidth: 120,
    fontSize: 12,
    color: '#666',
  },
});
