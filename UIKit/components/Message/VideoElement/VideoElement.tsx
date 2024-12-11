import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video'; // https://thewidlarzgroup.github.io/react-native-video
import { StoreName, TUIStore } from '@tencentcloud/chat-uikit-engine';

import { getWindowSize, computeSkeletonSize, isIOS } from '../../../utils';

interface IVideoElementProps {
  data: {
    snapshotWidth?: number;
    snapshotHeight?: number;
    snapshotUrl?: string;
    url?: string;
  };
  flow: string;
  isJoinedMessage?: boolean;
}

export const VideoElement = (props: IVideoElementProps) => {
  const {
    data,
    flow,
    isJoinedMessage,
  } = props;

  const [paused, setPaused] = useState<boolean>(true);
  const [showCover, setShowCover] = useState(true);
  const videoRef = useRef<any>(null);
  const { width: windowWidth } = getWindowSize();

  const max = windowWidth - 160;

  let {
    url,
    snapshotWidth = 0,
    snapshotHeight = 0,
    snapshotUrl = 'https://web.sdk.qcloud.com/im/assets/images/transparent.png',
  } = data;
  if (snapshotWidth === 0 || snapshotHeight === 0) {
    const localVideoInfo = TUIStore.getData(StoreName.CUSTOM, 'localImageAndVideoInfo');
    if (localVideoInfo?.has(url)) {
      const info = localVideoInfo.get(url);
      snapshotWidth = info.width;
      snapshotHeight = info.height;
    }
  }

  const size = computeSkeletonSize(snapshotWidth, snapshotHeight, max, max);
  snapshotWidth = size.width;
  snapshotHeight = size.height;

  let resizeMode: 'none' | 'stretch' | 'cover' | 'contain' | undefined = 'contain';
  if (snapshotHeight >= snapshotWidth) {
    resizeMode = 'cover';
  }

  const computeVideoElementContainerStyle = () => {
    let style: any = StyleSheet.flatten([styles.videoElementContainer, { width: snapshotWidth, height: snapshotHeight }]);
    if (flow === 'in') {
      style = StyleSheet.flatten([style, styles.videoElementContainerIn]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.videoElementContainerInJoined]);
      }
    } else {
      style = StyleSheet.flatten([style, styles.videoElementContainerOut]);
      if (isJoinedMessage) {
        style = StyleSheet.flatten([style, styles.videoElementContainerOutJoined]);
      }
    }
    return style;
  };

  const playVideo = () => {
    if (videoRef) {
      videoRef.current.presentFullscreenPlayer();
    }
  };

  const onFullscreenPlayerDidPresent = () => {
    setPaused(false);
    setShowCover(false);
  };

  const onFullscreenPlayerWillDismiss = () => {
    setPaused(true);
    setShowCover(true);
  };

  const onEnd = () => {
    setShowCover(true);
  };

  return (
    <View style={computeVideoElementContainerStyle()}>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.videoElement}
        resizeMode={resizeMode}
        paused={paused}
        controls={false}
        onFullscreenPlayerDidPresent={onFullscreenPlayerDidPresent}
        onFullscreenPlayerWillDismiss={onFullscreenPlayerWillDismiss}
        onEnd={onEnd}
      />
      {(isIOS || showCover) && (// default render for ios and render by showCover for andriod
        <Image
          style={styles.playEndCover}
          source={{ uri: snapshotUrl }}
        />
      )}
      <TouchableOpacity
        style={styles.playIconContainer}
        onPress={playVideo}
      >
        <Image
          style={styles.playIcon}
          source={require('../../../assets/video-play.png')}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  videoElementContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoElement: {
    width: '100%',
    height: '100%',
  },
  videoElementContainerIn: {
    borderBottomLeftRadius: 0,
  },
  videoElementContainerInJoined: {
    borderBottomLeftRadius: 16,
  },
  videoElementContainerOut: {
    borderBottomRightRadius: 0,
  },
  videoElementContainerOutJoined: {
    borderBottomRightRadius: 16,
  },
  playEndCover: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  playIconContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  playIcon: {
    width: 40,
    height: 40,
  },
});
