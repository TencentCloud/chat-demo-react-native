import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';

import { TUIStore, IMessageModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { ICloudCustomData, MessageQuoteTypeEnum } from './interface';
import { Toast } from '../../Toast';
import { QuotedImage } from './QuotedImage';
import { QuotedVideo } from './QuotedVideo';
import { QuotedFile } from './QuotedFile';
import { QuotedText } from './QuotedText';
import { useChatContext } from '../../../context';
import { parseJSON } from '../../../utils';

interface IQuoteComponentProps {
  message: IMessageModel;
  isJoinedMessage: boolean;
}

const VIDEO_AND_IMAGE_ELEMENT_MAXWIDTH = 60;

export const MessageQuote = (props: IQuoteComponentProps) => {
  const { message, isJoinedMessage } = props;
  const [quotedMessage, setQuotedMessage] = useState<IMessageModel>();
  const [messageQuotedContent, setMessageQuotedContent] = useState<Record<string, any>>();
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const { messageList, setHightedMessageID, messageListRef } = useChatContext();

  const defaultQuotedContentMap = {
    [MessageQuoteTypeEnum.TYPE_CUSTOM]: 'CUSTOM_MESSAGE',
    [MessageQuoteTypeEnum.TYPE_SOUND]: 'VOICE',
    [MessageQuoteTypeEnum.TYPE_LOCATION]: 'LOCATION',
    [MessageQuoteTypeEnum.TYPE_FACE]: 'STICKERS',
    [MessageQuoteTypeEnum.TYPE_MERGER]: 'CHAT_HISTORY',
  };

  useEffect(() => {
    const cloudCustomData: ICloudCustomData = parseJSON(message.cloudCustomData);
    const _messageQuotedContent = cloudCustomData.messageReply;
    if (!_messageQuotedContent) {
      return;
    }
    setMessageQuotedContent(_messageQuotedContent);
    const _quotedMessage = TUIStore.getMessageModel(_messageQuotedContent.messageID);
    setQuotedMessage(_quotedMessage);
  }, [message]);

  const JumpToQuotedMessage = () => {
    if (!quotedMessage || quotedMessage?.isRevoked || quotedMessage?.isDeleted) {
      setToastVisible(true);
      return;
    }
    setHightedMessageID(quotedMessage.ID);
    const index = messageList.findIndex((item: IMessageModel) => item.ID === quotedMessage.ID);
    if (index !== -1) {
      messageListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  };

  const renderQuotedMessage = () => {
    const renderDefaultQuotedContent = (content: string) => (
      <Text style={styles.quotedMessageText}>
        {TUITranslateService.t(`Chat.${content}`)}
      </Text>
    );

    if (quotedMessage?.isRevoked || quotedMessage?.isDeleted) {
      return null;
    }
    switch (messageQuotedContent?.messageType) {
      case MessageQuoteTypeEnum.TYPE_TEXT:
        return (
          <QuotedText
            originalMessage={quotedMessage}
            quotedContent={messageQuotedContent}
            quotedTextStyle={styles.quotedMessageText}
          />
        );
      case MessageQuoteTypeEnum.TYPE_IMAGE:
        return (
          <QuotedImage
            originalMessage={quotedMessage}
            quotedTextStyle={styles.quotedMessageText}
            maxWidth={VIDEO_AND_IMAGE_ELEMENT_MAXWIDTH}
          />
        );
      case MessageQuoteTypeEnum.TYPE_FILE:
        return (
          <QuotedFile
            originalMessage={quotedMessage}
            quotedTextStyle={styles.quotedMessageText}
          />
        );

      case MessageQuoteTypeEnum.TYPE_VIDEO:
        return (
          <QuotedVideo
            originalMessage={quotedMessage}
            quotedTextStyle={styles.quotedMessageText}
            maxWidth={VIDEO_AND_IMAGE_ELEMENT_MAXWIDTH}
          />
        );
    }
    const messageType = messageQuotedContent?.messageType as keyof typeof defaultQuotedContentMap;
    return renderDefaultQuotedContent(defaultQuotedContentMap[messageType]);
  };

  return (
    <View
      style={[
        styles.quotedMessageContainer,
        isJoinedMessage && styles.quotedMessageContainerJoined,
        message.flow === 'in'
          ? styles.quoteMessageIn
          : styles.quoteMessageOut,
      ]}
    >
      <View style={[
        styles.quotedMessageBox,
        message.flow === 'in'
          ? styles.quoteMessageBoxIn
          : styles.quoteMessageBoxOut]}
      />
      <TouchableOpacity
        style={styles.quotedMessage}
        onPress={JumpToQuotedMessage}
      >
        {!quotedMessage?.isRevoked && (
          <Text
            style={styles.quotedMessageName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {`${message.nick || message.from}: `}
          </Text>
        )}
        {renderQuotedMessage()}
        {quotedMessage?.isRevoked && (
          <Text style={styles.revokedText}>
            {TUITranslateService.t('Chat.QUOTED_MESSAGE_REVOKED')}
          </Text>
        )}
        {quotedMessage?.isDeleted && (
          <Text style={styles.revokedText}>
            {TUITranslateService.t('Chat.QUOTED_MESSAGE_DELETED')}
          </Text>
        )}
        <Toast
          visible={toastVisible}
          setVisible={setToastVisible}
          text={TUITranslateService.t('Chat.UNABLE_TO_QUOTED_MESSAGE')}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quotedMessageContainer: {
    marginTop: 5,
    marginBottom: 16,
  },
  quotedMessageContainerJoined: {
    marginBottom: 5,
  },
  quoteMessageIn: {
    alignSelf: 'flex-start',
    marginLeft: 44,
  },
  quoteMessageOut: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  quotedMessageBox: {
    position: 'absolute',
    top: -8,
    width: 10,
    height: 26,
    borderColor: '#ECEBEB',
    borderBottomWidth: 0.5,
  },
  quoteMessageBoxIn: {
    left: -8,
    borderBottomLeftRadius: 10,
    borderLeftWidth: 0.5,
  },
  quoteMessageBoxOut: {
    right: -8,
    borderBottomRightRadius: 10,
    borderRightWidth: 0.5,
  },
  quotedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9F0',
    borderRadius: 10,
    padding: 8,
  },
  quotedMessageName: {
    fontSize: 12,
    color: '#666666',
    maxWidth: 80,
  },
  revokedText: {
    color: '#999999',
    fontSize: 12,
  },
  quotedMessageText: {
    maxWidth: 200,
    flexWrap: 'wrap',
    color: '#666666',
    fontSize: 12,
  },
});
