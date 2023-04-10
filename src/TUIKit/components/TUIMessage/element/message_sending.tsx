import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';

export const MessageSending = () => {
  const [rotateAnimation] = useState(new Animated.Value(0));

  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [
      {
        rotate: interpolateRotating,
      },
    ],
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ).start();
    return () => {
      rotateAnimation.stopAnimation();
    };
  }, [rotateAnimation]);

  return (
    <Animated.Image
      style={[animatedStyle, {width: 14, height: 14}]}
      source={require('../../../../assets/message_sending.png')}
    />
  );
};
