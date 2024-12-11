import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';

interface IProfileEditorProps {
  title: string;
  value: string;
  onConfirm: (value: string) => void;
}

export const ProfileEditor = (props: IProfileEditorProps) => {
  const { title, value, onConfirm } = props;

  const [inputValue, setInputValue] = useState<string>(value);

  const onChangeText = (text: string) => {
    setInputValue(text);
  };

  const _onConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  return (
    <View style={styles.editProfileContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{title}</Text>
          <Image
            style={styles.closeIcon}
            source={require('../../assets/close-gray.png')}
          />
        </View>
        <KeyboardAvoidingView>
          <TextInput
            style={styles.textInput}
            multiline
            value={inputValue}
            onChangeText={onChangeText}
          />
        </KeyboardAvoidingView>
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          style={styles.confirmContainer}
          onPress={_onConfirm}
        >
          <Text style={styles.confirmText}>{TUITranslateService.t('Common.CONFIRM')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editProfileContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  contentContainer: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  textInput: {
    minHeight: 36,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F9F9F9F0',
  },
  confirmContainer: {
    height: 46,
    marginHorizontal: 16,
    marginBottom: 48,
    borderRadius: 8,
    backgroundColor: '#147AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
