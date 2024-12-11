import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface BadgeProps {
  value?: string | number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

function UnMemoizedBadgePreview(props: BadgeProps) {
  const {
    value,
    containerStyle,
    textStyle,
  } = props;

  return (
    <View style={StyleSheet.flatten([styles.container, styles.badge, !value && styles.minBadge, containerStyle])}>
      {value && (<Text style={StyleSheet.flatten([styles.value, textStyle])}>{value}</Text>)}
    </View>
  );
}

const size = 16;
const minSize = 10;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3742',
  },
  badge: {
    minWidth: size,
    height: size,
    borderRadius: size / 2,
    paddingHorizontal: 5,
  },
  minBadge: {
    minWidth: minSize,
    height: minSize,
    borderRadius: minSize / 2,
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export const Badge = React.memo(UnMemoizedBadgePreview) as typeof UnMemoizedBadgePreview;
