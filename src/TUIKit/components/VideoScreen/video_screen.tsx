import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import {Image, Slider, Text} from '@rneui/themed';
import React from 'react';
import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {V2TimMessage} from 'react-native-tim-js';
import Video from 'react-native-video';

export const VideoScreen = ({
  url,
  onScreenDismissed,
}: {
  url: string;
  message: V2TimMessage;
  onScreenDismissed: Function;
}) => {
  const [isLoad, setIsLoad] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [isError, setIsError] = useState(false);
  const [videoDuration, setDuration] = useState(0);
  const [videoCurrentTime, setCurrentTime] = useState(0);
  const player = useRef<Video | null>();
  const {bottom, top} = useSafeAreaInsets();

  const saveToLocal = async () => {
    if (url) {
      CameraRoll.save(url);
    }
  };
  return (
    <View style={[styles.videoScreen, styles.black]}>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsPause(!isPause);
        }}>
        <View style={styles.fill}>
          <Video
            ref={ref => (player.current = ref)}
            source={{
              uri: url,
            }}
            onError={() => {
              setIsLoad(false);
              setIsError(true);
            }}
            onLoad={loadData => {
              const {duration} = loadData;
              setDuration(duration);
              setIsLoad(false);
            }}
            onLoadStart={() => {
              setIsLoad(true);
            }}
            onProgress={progress => {
              const {currentTime} = progress;
              setCurrentTime(currentTime);
            }}
            onEnd={() => {
              setCurrentTime(videoDuration);
            }}
            paused={isPause}
            repeat={false}
            resizeMode={Platform.OS === 'android' ? 'cover' : undefined}
            style={[
              styles.fill,
              styles.black,
              {
                marginTop: top,
              },
            ]}
          />
          <View style={styles.controlContainer}>
            <Text style={styles.videoDurationText}>
              {(videoCurrentTime / 100).toFixed(2)}
            </Text>
            <Slider
              style={[styles.fill, {marginHorizontal: 10}]}
              value={videoCurrentTime}
              maximumValue={videoDuration}
              minimumValue={0}
              step={1}
              allowTouchTrack={false}
              trackStyle={[styles.white, {height: 5}]}
              thumbStyle={[styles.thumbStyle, styles.transparent]}
            />
            <Text style={styles.videoDurationText}>
              {(videoDuration / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {videoCurrentTime === videoDuration && !isLoad && (
        <View style={styles.errorContainer}>
          <Image
            source={require('../../../assets/play.png')}
            style={{
              width: styles.playContainer.width,
              height: styles.playContainer.height,
            }}
            onPress={() => {
              setIsPause(false);
              player.current?.seek(0);
            }}
          />
        </View>
      )}

      {/* <View style={styles.errorContainer}>
        <Image
          resizeMode="contain"
          source={require('../../../assets/play.png')}
          style={{
            width: 50,
            height: 50,
          }}
          onPress={() => {
            player.current?.seek(0);
            setIsPause(false);
          }}
        />
      </View> */}

      {isLoad && (
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>播放出错</Text>
        </View>
      )}
      <View
        style={[
          styles.download,
          {
            paddingBottom: bottom,
          },
        ]}>
        <Image
          source={require('../../../assets/close.png')}
          style={styles.iconSize}
          onPress={() => {
            onScreenDismissed();
          }}
        />
        <Image
          source={require('../../../assets/download.png')}
          style={styles.iconSize}
          onPress={() => {
            saveToLocal();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    maxHeight: 256,
    borderRadius: 10,
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  thumbStyle: {
    width: 1,
    height: 5,
  },
  black: {
    backgroundColor: 'black',
  },
  white: {
    backgroundColor: 'white',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  videoScreen: {
    width: ScreenWidth,
    height: ScreenHeight,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  download: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  iconPosition: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 40,
    left: 10,
  },
  iconSize: {
    width: 30,
    height: 30,
  },
  videoDurationText: {
    fontSize: 12,
    color: 'white',
  },
  playContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  duration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  durationText: {
    fontSize: 12,
    color: 'white',
  },
  iconDownload: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 40,
    right: 10,
  },
});
