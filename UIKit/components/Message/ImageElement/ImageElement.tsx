import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';

import { StoreName, TUIStore } from '@tencentcloud/chat-uikit-engine';

import { getWindowSize, computeSkeletonSize } from '../../../utils';

interface IImageElementProps {
  data: {
    width?: number;
    height?: number;
    url?: string;
  };
  flow: string;
  isJoinedMessage?: boolean;
}

export const ImageElement = (props: IImageElementProps) => {
  const { data, flow, isJoinedMessage } = props;
  const { width: windowWidth } = getWindowSize();
  const max = windowWidth - 160;

  let { width = 0, height = 0, url = '' } = data;
  if (width === 0 || height === 0) {
    const localImageInfo = TUIStore.getData(StoreName.CUSTOM, 'localImageAndVideoInfo');
    if (localImageInfo?.has(url)) {
      const info = localImageInfo.get(url);
      width = info.width;
      height = info.height;
    }
  }

  const size = computeSkeletonSize(width, height, max, max);
  width = size.width;
  height = size.height;

  const computeImageStyle = () => {
    let style: any = styles.imageElement;
    if (flow === 'in') {
      style = StyleSheet.flatten([style, styles.imageElementIn]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.imageElementInJoined]);
      }
    } else {
      style = StyleSheet.flatten([style, styles.imageElementOut]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.imageElementOutJoined]);
      }
    }
    return style;
  };
  return (
    <>
      <View style={{ width, height }}>
        <Image
          style={computeImageStyle()}
          resizeMode="contain"
          source={{ uri: url }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  imageElement: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageElementIn: {
    borderBottomLeftRadius: 0,
  },
  imageElementInJoined: {
    borderBottomLeftRadius: 16,
  },
  imageElementOut: {
    borderBottomRightRadius: 0,
  },
  imageElementOutJoined: {
    borderBottomRightRadius: 16,
  },
});
