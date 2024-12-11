import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface ILoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

export const Loading = (props: ILoadingProps) => {
  const { size = 'large', color = '#0365F9' } = props;
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
