import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ISwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
}

export const Switch = (props: ISwitchProps) => {
  const {
    value = false,
    onChange,
    trackStyle,
    thumbStyle,
  } = props;

  const onValueChange = () => {
    onChange && onChange(!value);
  };

  return (
    <View style={[
      styles.switchTrack,
      trackStyle,
      value && styles.trackBackground,
    ]}
    >
      <TouchableOpacity
        activeOpacity={0}
        onPress={onValueChange}
      >
        <View style={[
          styles.switchThumb,
          thumbStyle,
          value && styles.thumbPosition,
        ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 16,
    padding: 2,
    backgroundColor: '#78788029',
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  trackBackground: {
    backgroundColor: '#34C759',
  },
  thumbPosition: {
    alignSelf: 'flex-end',
  },
});
