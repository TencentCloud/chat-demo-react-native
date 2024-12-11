import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface IVoiceElementProps {
  data: string;
}

// TODO:
export const VoiceElement = (props: IVoiceElementProps) => {
  const { data } = props;
  return (
    <View style={styles.voiceElmentContainer}>
      <Text style={styles.txt}>{data}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  voiceElmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  txt: {
    color: '#000000',
    fontSize: 14,
  },
});
