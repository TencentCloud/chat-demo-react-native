import React, { forwardRef, PropsWithChildren, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  ViewStyle,
  GestureResponderEvent,
  PanResponderGestureState,
  StyleSheet,
  View,
} from 'react-native';
import { getWindowSize } from '../../utils';

interface SwipeRowProps {
  rightContent?: JSX.Element;
  rightContainerStyle?: ViewStyle;
  rightContentWidth: number;
  directionalDistanceChangeThreshold?: number;
  onTouchStart?: () => void;
  onReset?: () => void;
}

export interface ISwipeRowRef {
  closeRow: () => void;
}

function SwipeRowComponent(
  props: PropsWithChildren<SwipeRowProps>,
  ref: React.Ref<unknown> | undefined,
) {
  const {
    rightContentWidth = 0,
    directionalDistanceChangeThreshold = 2,
    children,
    rightContainerStyle = {},
    rightContent = null,
    onTouchStart,
    onReset,
  } = props;

  const pan = useRef(new Animated.Value(0)).current;
  const [offset, setOffset] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    closeRow: () => {
      if (offset !== 0) {
        _startAnimated(0);
      }
    },
  }));

  const _onMoveShouldSet = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const { dx } = gestureState;
    return Math.abs(dx) > directionalDistanceChangeThreshold;
  };

  const _onPanResponderGrant = () => {
    onTouchStart && onTouchStart();
  };

  const _onPanResponderMove = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const { dx, dy } = gestureState;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (
      absDx > directionalDistanceChangeThreshold
      || absDy > directionalDistanceChangeThreshold
    ) {
      if (absDy > absDx) {
        return;
      }

      if (dx > 0) {
        _startAnimated(0);
      } else {
        _startAnimated(-rightContentWidth);
      }
    }
  };
  const _onPanResponderRelease = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const { vx, dx } = gestureState;
    let num = 0;
    if (vx < 0.2 && dx < 0) {
      num = -rightContentWidth;
    }
    _startAnimated(num);
    pan.flattenOffset();
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: _onMoveShouldSet,
    onPanResponderGrant: _onPanResponderGrant,
    onPanResponderMove: _onPanResponderMove,
    onPanResponderRelease: _onPanResponderRelease,
  })).current;

  const _startAnimated = (num: number) => {
    setOffset(num);
    Animated.delay(0);
    Animated.timing(pan, {
      toValue: num,
      duration: 100,
      useNativeDriver: true,
    }).start();
    if (num === 0) {
      onReset && onReset();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: getWindowSize().width + rightContentWidth,
          transform: [{ translateX: pan }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
      <View style={rightContainerStyle}>
        {rightContent}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});

export const SwipeRow = forwardRef<ISwipeRowRef, PropsWithChildren<SwipeRowProps>>(SwipeRowComponent);
