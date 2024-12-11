import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Overlay } from '../Overlay';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

interface IPopConfirmProps {
  isVisible: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PopConfirm = (props: IPopConfirmProps) => {
  const {
    isVisible,
    title,
    confirmText = TUITranslateService.t('Common.CONFIRM'),
    cancelText = TUITranslateService.t('Common.CANCEL'),
    onConfirm,
    onCancel,
  } = props;

  return (
    <Overlay
      isVisible={isVisible}
      onClose={onCancel}
    >
      <View style={styles.popconfirmContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              delayPressIn={0}
              activeOpacity={1}
              style={[styles.textContainer, styles.addBorder]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              delayPressIn={0}
              activeOpacity={1}
              style={styles.textContainer}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  popconfirmContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  contentContainer: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    minHeight: 56,
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
  buttonContainer: {
    height: 46,
    flexDirection: 'row',
  },
  textContainer: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBorder: {
    borderColor: '#DDDDDD',
    borderRightWidth: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: '#147AFF',
  },
});
