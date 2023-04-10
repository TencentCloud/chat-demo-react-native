import {Image, Overlay} from '@rneui/themed';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, PanResponder} from 'react-native';
import {AudioPlayer} from '../../utils/audio_player';

interface VoiceButtonProps {
  onSend: (soundPath: string, soundSeconds: number) => void;
}

export const VoiceButton = (props: VoiceButtonProps) => {
  const [isPressed, setPressed] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);
  const soundPath = useRef('');
  const soundSeconds = useRef(0);
  const viewPageY = useRef(0);
  const viewNode = useRef<View | null>();
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setOutOfArea(false);
        setPressed(true);
      },
      onPanResponderMove: event => {
        if (Math.abs(event.nativeEvent.pageY - viewPageY.current) > 150) {
          setOutOfArea(true);
        } else {
          setOutOfArea(false);
        }
      },
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: () => {
        setPressed(false);
      },
    }),
  ).current;

  const startRecordSound = async () => {
    const soudLocalUrl = await AudioPlayer.startRecord(e => {
      soundSeconds.current = e.currentPosition / 1000;
    });
    soundPath.current = soudLocalUrl;
  };

  const stopRecordSound = () => {
    AudioPlayer.stopRecord();
    if (soundPath.current !== '' && soundSeconds.current !== 0) {
      props.onSend(soundPath.current, soundSeconds.current);
    }
  };

  useEffect(() => {
    if (isPressed) {
      startRecordSound();
    } else {
      stopRecordSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPressed]);

  const hanldeLayout = () => {
    viewNode.current?.measure((x, y, width, height, pageX, pageY) => {
      viewPageY.current = pageY;
    });
  };

  return (
    <View
      onLayout={hanldeLayout}
      ref={view => (viewNode.current = view)}
      {...panResponder.panHandlers}>
      <View style={[styles.container]}>
        <Text style={styles.text}>{isPressed ? '松开发送' : '按住说话'}</Text>
      </View>
      <Overlay
        isVisible={isPressed}
        // eslint-disable-next-line react-native/no-inline-styles
        backdropStyle={{opacity: 0}}
        overlayStyle={styles.overLayStyle}>
        <View style={styles.contentContainer}>
          <View style={styles.voiceImgContainer}>
            <Image
              source={require('../../../assets/sound/voice_volume_4.png')}
              resizeMode="contain"
              style={styles.micImage}
            />
          </View>
          <Text style={styles.textStyle}>
            {outOfArea ? '松开取消' : '手指上滑，取消发送'}
          </Text>
        </View>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    height: 35,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  textPrimary: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  textSecondary: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 17,
  },
  overLayStyle: {
    opacity: 0.8,
    backgroundColor: '#77797A',
    borderRadius: 20,
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    width: 160,
    height: 150,
  },
  micImage: {
    width: 120,
    height: 100,
  },
  voiceImgContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  textStyle: {
    fontSize: 14,
    color: 'white',
    marginTop: 20,
  },
});
