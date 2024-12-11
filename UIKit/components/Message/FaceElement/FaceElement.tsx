import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';

interface IFaceElementProps {
  data: Record<string, string>;
}

export const FaceElement = (props: IFaceElementProps) => {
  const { data } = props;
  return (
    <View style={styles.faceElmentContainer}>
      <Image
        style={styles.face}
        source={{ uri: data.url }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  faceElmentContainer: {
    backgroundColor: '#00000009',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  face: {
    width: 90,
    height: 88,
  },
});
