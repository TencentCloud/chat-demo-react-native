import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { Overlay } from '../Overlay';

interface IToastProps {
  text: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  duration?: number;
}

export const Toast = (props: IToastProps) => {
  const {
    text,
    visible,
    setVisible,
    duration = 1000,
  } = props;

  const opacity = new Animated.Value(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fadeIn = () => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const fadeOut = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    };

    if (visible) {
      fadeIn();
      timer = setTimeout(fadeOut, duration);
    }

    return () => clearTimeout(timer);
  }, [visible, duration, setVisible]);

  if (!visible) {
    return null;
  }

  return (
    <Overlay isVisible={visible} style={styles.toastContainer}>
      <Animated.View style={[styles.toastBox, { opacity }]}>
        <Text style={styles.toastText}>{text}</Text>
      </Animated.View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBox: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    maxWidth: '90%',
  },
  toastText: {
    color: 'white',
    fontSize: 14,
  },
});
