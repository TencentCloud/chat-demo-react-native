import {Text, Image} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {TencentImSDKPlugin} from 'react-native-tim-js';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';
import {updateMessateItem, useTUIChatContext} from '../../../store';
import {SOUND_READ} from '../../../constants';
import {AudioPlayer} from '../../../utils/audio_player';
import FastImage from 'react-native-fast-image';

export const AudioElement = (props: {message: V2TimMessage}) => {
  const {message} = props;
  const [stateMessage, setStateMessage] = useState(message);
  const [isPlaying, setPlaying] = useState(false);
  const {dispatch} = useTUIChatContext();
  const isSelf = stateMessage.isSelf ?? false;
  const img = isSelf
    ? require('../../../../assets/voice_send.png')
    : require('../../../../assets/voice_receive.png');
  const soundSecond = stateMessage.soundElem?.duration ?? 0;
  const soundText = isSelf ? ` ''${soundSecond} ` : ` ${soundSecond}'' `;
  const containerStyle = isSelf ? styles.selfContainer : styles.container;

  const getSoundLen = () => {
    const charLen = 8;
    let soundLen = 32;
    if (soundSecond !== 0) {
      const realSoundLen = soundSecond;
      let sdLen = 32;
      if (realSoundLen > 10) {
        sdLen =
          12 * charLen + Math.floor(((realSoundLen - 10) * charLen) / 0.5);
      } else if (realSoundLen > 2) {
        sdLen = 2 * charLen + realSoundLen * charLen;
      }
      sdLen = Math.min(sdLen, 20 * charLen);
      soundLen = sdLen;
    }
    return soundLen;
  };

  const playSound = async () => {
    const {soundElem, localCustomInt, msgID} = stateMessage;
    const soundPath = soundElem?.path ? 'file://' + soundElem?.path : undefined;
    const localUrl = soundElem?.localUrl
      ? 'file://' + soundElem?.localUrl
      : undefined;
    const url = soundElem?.url;
    const playPath = soundPath ?? localUrl ?? url;
    if (playPath) {
      AudioPlayer.play(
        playPath,
        playCallback => {
          setPlaying(true);
          const {currentPosition, duration} = playCallback;
          if (currentPosition === duration) {
            AudioPlayer.stop();
            setPlaying(false);
            if (!isSelf && (!localCustomInt || localCustomInt !== SOUND_READ)) {
              if (msgID) {
                TencentImSDKPlugin.v2TIMManager
                  .getMessageManager()
                  .setLocalCustomInt(msgID, SOUND_READ)
                  .then(response => {
                    if (response.code === 0) {
                      stateMessage.localCustomInt = SOUND_READ;
                      stateMessage.id = new Date().getTime().toString();
                      dispatch(updateMessateItem(stateMessage));
                    }
                  });
              }
            }
          }
        },
        () => {
          setPlaying(false);
        },
      );
    }
  };

  useEffect(() => {
    const {msgID, soundElem, progress} = stateMessage;
    const haveUrl = !!soundElem?.url;
    const havePath = !!soundElem?.path;
    const haveLocalUrl = !!soundElem?.localUrl;
    if (msgID) {
      if (!haveUrl || soundElem.url === '') {
        TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .getMessageOnlineUrl(msgID)
          .then(response => {
            const {code, data} = response;
            if (code === 0) {
              stateMessage.soundElem = data.soundElem;
              setStateMessage(stateMessage);
            }
          });
      }

      if (
        !havePath &&
        (!haveLocalUrl || soundElem!.localUrl === '') &&
        progress !== 1
      ) {
        TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .downloadMessage(msgID!, 4, 0, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getVoicePlayGif = () =>
    isSelf
      ? require('../../../../assets/play_voice_send.gif')
      : require('../../../../assets/play_voice_receive.gif');

  return (
    <TouchableOpacity onPress={playSound}>
      <View
        style={{
          ...containerStyle,
          width: getSoundLen(),
        }}>
        <Image
          ImageComponent={FastImage}
          source={isPlaying ? getVoicePlayGif() : img}
          style={styles.img}
        />
        <Text>{soundText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  selfContainer: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  img: {
    width: 16,
    height: 16,
  },
});

export const MemorizedAudioElement = React.memo(AudioElement, (prev, next) => {
  return (
    prev.message.msgID === next.message.msgID &&
    prev.message.timestamp === next.message.timestamp &&
    prev.message.seq === next.message.seq &&
    prev.message.id === next.message.id
  );
});
