import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { useChatContext } from '../../../context';
import { Overlay } from '../../Overlay';

interface IMessageToolboxProps {
  isVisible: boolean;
  opacity: number;
  closeToolbox: () => void;
}

export const MessageToolbox = (props: IMessageToolboxProps) => {
  const {
    isVisible,
    opacity,
    closeToolbox,
  } = props;
  const { pickPicture, takePhoto, recordVideo, pickFile } = useChatContext();
  const dataList = [
    {
      icon: require('../../../assets/album.png'),
      text: TUITranslateService.t('Chat.ALBUM'),
      handler: () => { pickPicture(closeToolbox); },
    },
    {
      icon: require('../../../assets/photo.png'),
      text: TUITranslateService.t('Chat.TAKE_PHOTO'),
      handler: () => { takePhoto(closeToolbox); },
    },
    {
      icon: require('../../../assets/video.png'),
      text: TUITranslateService.t('Chat.RECORD_VIDEO'),
      handler: () => { recordVideo(closeToolbox); },
    },
    {
      icon: require('../../../assets/file.png'),
      text: TUITranslateService.t('Chat.SELECT_FILE'),
      handler: () => { pickFile(closeToolbox); },
    },
  ];

  return (
    <Overlay
      isVisible={isVisible}
      style={{ opacity: opacity }}
      onClose={closeToolbox}
    >
      <View style={styles.toolboxContainer}>
        <View style={styles.toolbox}>
          {
            dataList.map((item, index) => (
              <TouchableOpacity
                key={index}
                delayPressIn={0}
                activeOpacity={1}
                onPress={item.handler}
              >
                <View style={[styles.toolItem, index === 3 && styles.hideBorder]}>
                  <Image style={styles.toolIcon} source={item.icon} />
                  <Text style={styles.toolText}>{item.text}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </View>
        <View style={styles.cancelContainer}>
          <Text style={styles.cancel}>{TUITranslateService.t('Common.CANCEL')}</Text>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  toolboxContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 34,

  },
  toolbox: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
  },
  toolItem: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    paddingHorizontal: 22,
  },
  hideBorder: {
    borderBottomWidth: 0,
  },
  toolIcon: {
    width: 26,
    height: 21,
    marginRight: 10,
  },
  toolText: {
    fontSize: 17,
    color: '#007AFF',
  },
  cancelContainer: {
    marginTop: 12,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});
