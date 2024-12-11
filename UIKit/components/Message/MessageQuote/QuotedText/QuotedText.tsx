import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { transformTextWithKeysToEmojiNames } from '../../../../emojiConfig';

interface IQuotedTextProps {
  originalMessage: IMessageModel | undefined;
  quotedContent: Record<string, string>;
  quotedTextStyle?: TextStyle;
}

export const QuotedText = (props: IQuotedTextProps) => {
  const {
    originalMessage,
    quotedContent,
    quotedTextStyle,
  } = props;

  if (!originalMessage) {
    return (
      <Text style={quotedTextStyle}>
        {transformTextWithKeysToEmojiNames(quotedContent?.messageAbstract)}
      </Text>
    );
  }

  const _messageContent = originalMessage.getMessageContent();

  return (
    <View style={styles.textElementContainer}>
      {_messageContent.text.map((item, index) => {
        return item.name === 'text'
          ? (
              <Text
                key={index}
                style={styles.quotedMessageText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.text}
              </Text>
            )
          : item.name === 'img'
            ? (
                <Image
                  key={index}
                  style={styles.textElementEmoji}
                  source={{ uri: item.src }}
                />
              )
            : null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  textElementContainer: {
    maxWidth: 200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: '#666',
  },
  textElementEmoji: {
    width: 20,
    height: 20,
  },
  quotedMessageText: {
    maxWidth: 200,
    flexWrap: 'wrap',
    color: '#666',
    fontSize: 12,
  },
});
