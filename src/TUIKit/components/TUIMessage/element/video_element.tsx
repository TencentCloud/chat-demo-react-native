import React, {useEffect, useState} from 'react';
import {V2TimMessage, TencentImSDKPlugin} from 'react-native-tim-js';
import {updateMessateItem, useTUIChatContext} from '../../../store';
import {View} from 'react-native';
import {StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {Text, Image} from '@rneui/themed';
import {MessageUtils} from '../../../utils/message';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import {VideoScreen} from '../../VideoScreen/video_screen';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import FastImage from 'react-native-fast-image';

export const VideoElement = (props: {
  message: V2TimMessage;
  isReplyMessage?: boolean;
}) => {
  const {message, isReplyMessage} = props;
  const {dispatch} = useTUIChatContext();
  const [isVisible, setVisible] = useState(false);
  const [snapShotPath, setSnapShotPath] = useState('');
  const {msgID, videoElem, progress} = message;
  const maxSnapshotWidth = isReplyMessage ? 150 : ScreenWidth * 0.5;
  const maxSnapshotHeight = isReplyMessage ? 100 : 300;
  const [videoUrl, setVideoUrl] = useState('');
  const snapshotWidth = message.videoElem?.snapshotWidth;
  const snapshotHeight = message.videoElem?.snapshotHeight;
  const localSnapshotUrl = message.videoElem?.snapshotPath;
  const snapshotUrl =
    message.videoElem?.localSnapshotUrl ?? message.videoElem?.snapshotUrl;
  const haveVideoUrl = !!videoElem?.videoUrl;
  const haveLocalSnapshotUrl = !!videoElem?.localSnapshotUrl;
  const haveLocalVideoUrl = !!videoElem?.localVideoUrl;
  const uri = message.videoElem?.localVideoUrl ?? message.videoElem?.videoUrl;
  const seconds = message.videoElem?.duration ?? 0;
  const videoPath = message.videoElem?.videoPath;
  const haveLocalVideoPath = !!videoPath;

  useEffect(() => {
    const getOnlineMessgeUrl = async (
      msgID: string,
      orginalMessage: V2TimMessage,
    ) => {
      const response = await TencentImSDKPlugin.v2TIMManager
        .getMessageManager()
        .getMessageOnlineUrl(msgID);
      if (response.data != null) {
        const videoElem = response.data!.videoElem;
        orginalMessage.videoElem = videoElem;
        dispatch(updateMessateItem(orginalMessage));
      }
    };
    if (msgID) {
      if (!haveVideoUrl || videoElem?.videoUrl === '') {
        getOnlineMessgeUrl(msgID, message);
      }
      if (progress === 0) {
        if (!haveLocalSnapshotUrl || videoElem?.localSnapshotUrl === '') {
          downloadSnapshot(msgID);
        }
        if (!haveLocalVideoUrl || videoElem?.localVideoUrl === '') {
          downloadVideoElement(msgID);
        }
      }
    }
  }, [
    dispatch,
    haveLocalSnapshotUrl,
    haveLocalVideoUrl,
    haveVideoUrl,
    message,
    msgID,
    progress,
    videoElem?.localSnapshotUrl,
    videoElem?.localVideoUrl,
    videoElem?.videoUrl,
  ]);

  useEffect(() => {
    console.log('get snapshot path');
    const getSnapshotRenderUrl = async () => {
      const haveLocalSnapshotPath = !!localSnapshotUrl;
      if (haveLocalSnapshotPath) {
        const isExist = await RNFS.exists(localSnapshotUrl!);
        if (isExist) {
          console.log('formatedPath', localSnapshotUrl);
          setSnapShotPath(localSnapshotUrl!);
          return;
        }
      }
      setSnapShotPath(snapshotUrl ?? '');
    };

    const getVideoRenderUrl = async () => {
      if (haveLocalVideoPath) {
        const isExist = await RNFS.exists(videoPath!);
        if (isExist) {
          setVideoUrl(videoPath!);
          return;
        }
      }
      setVideoUrl(uri!);
    };
    getSnapshotRenderUrl();
    getVideoRenderUrl();
  }, [haveLocalVideoPath, localSnapshotUrl, snapshotUrl, uri, videoPath]);

  const downloadVideoElement = async (msgID: string) => {
    TencentImSDKPlugin.v2TIMManager
      .getMessageManager()
      .downloadMessage(msgID, 5, 0, false);
  };

  const downloadSnapshot = (msgID: string) => {
    TencentImSDKPlugin.v2TIMManager
      .getMessageManager()
      .downloadMessage(msgID, 5, 0, true);
  };

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={() => {
          setVisible(true);
        }}
        activeOpacity={0.8}>
        {snapShotPath !== '' && (
          <Image
            ImageComponent={FastImage}
            source={{uri: snapShotPath}}
            style={{
              ...styles.video,
              width: snapshotWidth,
              height: snapshotHeight,
              maxWidth: maxSnapshotWidth,
              maxHeight: Math.min(ScreenHeight * 0.8, maxSnapshotHeight),
            }}
          />
        )}
      </TouchableOpacity>

      <View style={styles.playContainer}>
        <Image
          ImageComponent={FastImage}
          source={require('../../../../assets/play.png')}
          style={{
            width: styles.playContainer.width,
            height: styles.playContainer.height,
          }}
          onPress={() => {
            setVisible(true);
          }}
        />
      </View>
      <View style={styles.duration}>
        <Text style={styles.durationText}>
          {MessageUtils.formatVideoTime(seconds)}
        </Text>
      </View>

      <Modal
        isVisible={isVisible}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0}
        swipeDirection={['down', 'up', 'left', 'right']}
        onSwipeComplete={() => setVisible(false)}
        swipeThreshold={100}
        style={{margin: 0}}>
        <VideoScreen
          url={videoUrl}
          message={message}
          onScreenDismissed={() => setVisible(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  video: {
    maxHeight: 256,
    borderRadius: 10,
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
