import {ScreenWidth} from '@rneui/base';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js';

export const FaceElement = (props: {message: V2TimMessage}) => {
  const {
    message: {faceElem},
  } = props;
  const path = faceElem?.data;

  const isFromNetWork = path?.startsWith('http');
  return (
    <View style={styles.faceContainer}>
      {isFromNetWork ? (
        <Text>network face image</Text>
      ) : (
        <Text>local face imag</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  faceContainer: {
    padding: 10,
    maxWidth: ScreenWidth * 0.3,
  },
});
