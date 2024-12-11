import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

import { StoreName, TUIStore } from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../Overlay';

import { getWindowSize } from '../../utils';

import { useChatContext } from '../../context';

const { width: maxWidth, height: maxHeight } = getWindowSize();

export const PreviewImage = () => {
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>('');

  const {
    imagePreviewVisible,
    setImagePreviewVisible,
    imagePreviewData,
    setImagePreviewData,
  } = useChatContext();

  useEffect(() => {
    if (imagePreviewVisible) {
      let { width = 0, height = 0, url = '' } = imagePreviewData;
      setImageUrl(url);
      if (width === 0 || height === 0) {
        const localImageInfo = TUIStore.getData(StoreName.CUSTOM, 'localImageAndVideoInfo');
        if (localImageInfo?.has(url)) {
          const info = localImageInfo.get(url);
          width = info.width;
          height = info.height;
        }
      }
      setOriginalWidth(width);
      setOriginalHeight(height);
    }
  }, [imagePreviewVisible, imagePreviewData]);

  const closeImagePreview = () => {
    setImagePreviewVisible(false);
    setImagePreviewData({});
  };

  return (
    <Overlay
      isVisible={imagePreviewVisible}
      style={styles.overlayStyle}
      animationType="fade"
      onClose={closeImagePreview}
    >
      <Image
        style={{
          width: originalWidth,
          height: originalHeight,
          maxWidth,
          maxHeight,
        }}
        resizeMode="contain"
        source={{ uri: imageUrl }}
      />
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});
