import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  NativeSyntheticEvent,
  View,
  Image,
  TextInput,
  TextInputSubmitEditingEventData,
  TouchableOpacity,
  TextInputContentSizeChangeEventData,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import TUIChatEngine, {
  TUITranslateService,
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';

import { MessageToolbox } from './MessageToolbox';
import { MessageQuotePanel } from './MessageQuotePanel';
import { EmojiPanel } from './EmojiPanel';
import { Mention } from './Mention';
import { MessageActionsEnum } from '../MessageActions/ActionsPanel';

import { useChatContext } from '../../context';
import { transformTextWithKeysToEmojiNames, transformTextWithEmojiNamesToKeys } from '../../emojiConfig';

import { isIOS } from '../../utils';

export interface IMessageInputProps {
  enableToolbox?: boolean;
  enableEmoji?: boolean;
  enableVoice?: boolean;
  enableCamera?: boolean;
}

export const MessageInput = (props?: IMessageInputProps) => {
  const inputTextRef = useRef<any>();
  const inputContainerHeight = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState<string>('');
  const [isShowToolbox, setShowToolbox] = useState<boolean>(false);
  const [toolboxOpacity, setToolboxOpacity] = useState<number>(1);
  const [messageQuotePanelVisible, setMessageQuotePanelVisible] = useState<boolean>(false);

  const {
    enableToolbox: defaultEnableToolbox,
    enableEmoji: defaultEnableEmoji,
    enableVoice: defaultEnableVoice,
    enableCamera: defaultEnableCamera,
    emojiPanelOpened,
    setTextInputFocused,
    setTextInputBlured,
    setEmojiPanelOpened,
    sendTextMessage,
    sendTextAtMessage,
    takePhoto,
    actionsMessageModel,
    mentionText,
    mentionUserList,
    setMentionText,
    setMentionUserList,
  } = useChatContext();

  const {
    enableToolbox = defaultEnableToolbox,
    enableEmoji = defaultEnableEmoji,
    enableVoice = defaultEnableVoice,
    enableCamera = defaultEnableCamera,
  } = props;

  const currentConversation = TUIStore.getData(StoreName.CONV, 'currentConversation');
  const isGroupChat = currentConversation?.type === TUIChatEngine.TYPES.CONV_GROUP;

  // Recall message for re-edit
  useEffect(() => {
    if (actionsMessageModel && actionsMessageModel[MessageActionsEnum.RECALL]) {
      const messageText = actionsMessageModel[MessageActionsEnum.RECALL].getMessageContent();
      const textValue = getMessageTextContent(messageText.text);
      setText(textValue);
      inputTextRef?.current?.focus();
    }
    if (actionsMessageModel && actionsMessageModel[MessageActionsEnum.QUOTE]) {
      setMessageQuotePanelVisible(true);
      const timer = setTimeout(() => {
        inputTextRef.current.focus();
        timer && clearTimeout(timer);
      }, 150);
    }
  }, [actionsMessageModel, inputTextRef]);

  // Input mention text.
  useEffect(() => {
    setText(mentionText);
  }, [mentionText]);

  const getMessageTextContent = (messageContent: Record<string, any>): string => {
    return messageContent.reduce((content: string, item: Record<string, any>) => {
      if (item.name === 'text') {
        content += item.text;
      } else if (item.name === 'img') {
        content += transformTextWithKeysToEmojiNames(item.emojiKey);
      }
      return content;
    }, '');
  };

  const showToolbox = () => {
    setToolboxOpacity(1);
    setShowToolbox(true);
    inputTextRef?.current?.blur();
  };

  const closeToolbox = (isOnlyUpdateOpacity?: boolean) => {
    if (isOnlyUpdateOpacity) {
      setToolboxOpacity(0);
      return;
    }
    setShowToolbox(false);
  };

  const toggleEmojiPanel = () => {
    const value = !emojiPanelOpened;
    if (value) {
      inputTextRef?.current?.blur();
    } else {
      inputTextRef?.current?.focus();
    }
    setEmojiPanelOpened(value);
  };

  const onFocus = () => {
    setTextInputFocused(true);
    setTextInputBlured(false);
    setEmojiPanelOpened(false);
  };

  const onBlur = () => {
    setTextInputFocused(false);
    setTextInputBlured(true);
  };

  const onChangeText = (value: string) => {
    if (isGroupChat) {
      setGroupText(value);
      return;
    }
    setText(value);
  };

  const onSubmitEditing = (event?: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (text) {
      const txt = transformTextWithEmojiNamesToKeys(text);
      if (mentionUserList.length > 0) {
        sendTextAtMessage(text, mentionUserList);
      } else {
        sendTextMessage(txt);
      }
      setText('');
      setMentionText('');
      setMentionUserList([]);
      setMessageQuotePanelVisible(false);
    }
    event?.preventDefault();
  };

  const onContentSizeUpdate = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    const inputHeight = isIOS ? event.nativeEvent.contentSize.height + 20 : event.nativeEvent.contentSize.height;
    Animated.timing(inputContainerHeight, {
      toValue: inputHeight,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const onSelectEmoji = (emojiKey: string) => {
    const key = transformTextWithKeysToEmojiNames(emojiKey);
    const txt = text + key;
    setText(txt);
  };

  const onDeleteEmoji = () => {
    const reg = /(\[.+?\])/g;
    const arr = text.split(reg);
    const ret = [];
    for (let i = 0; i < arr.length; i++) {
      if (reg.test(arr[i])) {
        ret.push(arr[i]);
      } else {
        ret.push(...arr[i].split(''));
      }
    }
    ret.pop();
    setText(ret.join(''));
  };

  const setGroupText = (value: string) => {
    // Set mention text when you enter '@' to input.
    if (value.length > text.length) {
      if (value.endsWith('@')) {
        setMentionText(value);
        return;
      }
      setText(value);
    }
    // Delete mention text when you delete text from input.
    if (value.length < text.length) {
      // Clear mention info when the value is empty.
      if (!value) {
        setText(value);
        setMentionText('');
        setMentionUserList([]);
        return;
      }
      if (value.includes('@') && !value.startsWith(mentionText)) {
        const valueArr = value.split('@');
        const lastIndex = valueArr.length - 1;
        if (valueArr[lastIndex].split(' ').length > 1) {
          setText(value);
          return;
        }
        valueArr.pop();
        mentionUserList.pop();
        const newText = valueArr.join('@').slice(0, -1);
        // Mention text has been deleted finished when the mentionText dons't includes newText.
        if (mentionText.includes(newText)) {
          setMentionText(newText);
        } else {
          setText(newText);
        }
        setMentionUserList(mentionUserList);
        return;
      }
      setText(value);
    }
  };

  return (
    <KeyboardAvoidingView
      enabled={isIOS}
      behavior={isIOS ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <SafeAreaView>
        <View style={styles.toolBarContainer}>
          {enableToolbox && (
            <TouchableOpacity
              delayPressIn={0}
              onPress={showToolbox}
            >
              <Image
                source={require('../../assets/input-more.png')}
                style={styles.iconSize}
              />
            </TouchableOpacity>
          )}
          <Animated.View style={[styles.inputContainer, { height: inputContainerHeight }]}>
            <TextInput
              ref={inputTextRef}
              style={[
                styles.inputText,
                isIOS && styles.iosInputStyle,
              ]}
              multiline={true}
              blurOnSubmit={true}
              placeholder={`${TUITranslateService.t('Chat.INPUT_PLACEHOLDER')}`}
              placeholderTextColor="#666666"
              returnKeyType="send"
              onFocus={onFocus}
              onBlur={onBlur}
              onChangeText={onChangeText}
              onSubmitEditing={onSubmitEditing}
              onContentSizeChange={onContentSizeUpdate}
              value={text}
            />
            {enableEmoji && (
              <TouchableOpacity
                delayPressIn={0}
                onPress={toggleEmojiPanel}
              >
                <Image
                  source={emojiPanelOpened ? require('../../assets/keyboard.png') : require('../../assets/emoji.png')}
                  style={styles.inputEmoji}
                />
              </TouchableOpacity>
            )}
          </Animated.View>
          {enableVoice && (
            <Image
              source={require('../../assets/voice.png')}
              style={[styles.iconSize, styles.voiceIcon]}
            />
          )}
          {enableCamera && (
            <TouchableOpacity
              delayPressIn={0}
              onPress={() => { takePhoto(); }}
            >
              <Image
                source={require('../../assets/camera.png')}
                style={styles.iconSize}
              />
            </TouchableOpacity>
          )}
        </View>
        {emojiPanelOpened && (
          <EmojiPanel
            onSelectEmoji={onSelectEmoji}
            onDeleteEmoji={onDeleteEmoji}
            onSubmitEditing={onSubmitEditing}
          />
        )}
        <MessageToolbox
          isVisible={isShowToolbox}
          opacity={toolboxOpacity}
          closeToolbox={closeToolbox}
        />
        <Mention />
      </SafeAreaView>
      {messageQuotePanelVisible && (
        <MessageQuotePanel
          message={actionsMessageModel[MessageActionsEnum.QUOTE]}
          setMessageQuotePanelVisible={setMessageQuotePanelVisible}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  toolBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 38,
    fontSize: 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    marginHorizontal: 16,
  },
  inputText: {
    flex: 1,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  iosInputStyle: {
    paddingBottom: 6,
  },
  inputEmoji: {
    height: 18,
    width: 18,
    marginRight: 16,
  },
  iconSize: {
    height: 24,
    width: 24,
  },
  voiceIcon: {
    marginRight: 16,
  },
});
