import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

import { Avatar } from '../Avatar';

import { useChatContext } from '../../context';
import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

export interface IChatHeaderProps {}

export const ChatHeader = () => {
  const {
    currentConversation,
    navigateBack,
    navigateToChatSetting,
  } = useChatContext();

  const _navigateBack = () => {
    navigateBack?.();
  };

  const _navigateToChatSetting = () => {
    if (currentConversation?.type === TUIChatEngine.TYPES.CONV_GROUP) {
      navigateToChatSetting?.();
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.chatHeaderContainer}>
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          style={styles.gobackArea}
          onPress={_navigateBack}
        >
          <Image
            style={styles.gobackIcon}
            source={require('../../assets/arrow-back.png')}
          />
        </TouchableOpacity>
        <Avatar uri={currentConversation?.getAvatar() || ''} />
        <View style={styles.chatInfo}>
          <Text
            numberOfLines={1}
            style={styles.chatName}
          >
            {currentConversation?.getShowName()}
          </Text>
        </View>
        {currentConversation?.type === TUIChatEngine.TYPES.CONV_GROUP && (
          <TouchableOpacity
            style={styles.chatDetail}
            delayPressIn={0}
            activeOpacity={1}
            onPress={_navigateToChatSetting}
          >
            <Image
              style={styles.chatDetailIcon}
              source={require('../../assets/chat-detail.png')}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chatHeaderContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  gobackArea: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gobackIcon: {
    width: 9,
    height: 16,
  },
  chatInfo: {
    marginLeft: 8,
  },
  chatName: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  chatDetail: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  chatDetailIcon: {
    width: 24,
    height: 24,
  },
});
