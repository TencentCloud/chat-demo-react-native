import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

import TUIChatEngine, {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { transformTextWithKeysToEmojiNames } from '../../../emojiConfig';

interface IMessageQuotePanelProps {
  message: IMessageModel;
  style?: ViewStyle;
  setMessageQuotePanelVisible: (visible: boolean) => void;
}
export const MessageQuotePanel = (props: IMessageQuotePanelProps) => {
  const { message, setMessageQuotePanelVisible } = props;
  const quoteContentTextMap: Record<string, string> = {
    [TUIChatEngine.TYPES.MSG_IMAGE]: 'IMAGE',
    [TUIChatEngine.TYPES.MSG_AUDIO]: 'VOICE',
    [TUIChatEngine.TYPES.MSG_VIDEO]: 'VIDEO',
    [TUIChatEngine.TYPES.MSG_FILE]: 'FILE',
    [TUIChatEngine.TYPES.MSG_CUSTOM]: 'CUSTOM_MESSAGE',
    [TUIChatEngine.TYPES.MSG_FACE]: 'STICKERS',
    [TUIChatEngine.TYPES.MSG_MERGER]: 'CHAT_HISTORY',
  };

  const quoteContentText = () => {
    if (!message) {
      return '';
    }
    if (message.type === TUIChatEngine.TYPES.MSG_TEXT) {
      return transformTextWithKeysToEmojiNames(message.payload?.text);
    }
    return TUITranslateService.t(`Chat.${quoteContentTextMap[message.type]}`);
  };

  const clearQuoteMessage = () => {
    setMessageQuotePanelVisible(false);
    TUIStore.update(StoreName.CHAT, 'quoteMessage', { message: undefined, type: 'quote' });
  };

  return (
    <View style={styles.quoteContainer}>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {`${message.nick || message.from}: ${quoteContentText()}`}
      </Text>
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        onPress={clearQuoteMessage}
        style={styles.clearIconContainer}
      >
        <Image
          source={require('../../../assets/clear.png')}
          style={[styles.iconClear]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quoteContainer: {
    backgroundColor: '#F2F7FF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  clearIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconClear: {
    width: 16,
    height: 16,
  },
});
