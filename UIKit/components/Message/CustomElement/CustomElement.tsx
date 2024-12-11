import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { type IMessageModel } from '@tencentcloud/chat-uikit-engine';

export interface ICustomElementProps {
  message?: IMessageModel;
  data?: string;
}

export const CustomElement = (props: ICustomElementProps) => {
  const { data } = props;
  return (
    <View style={styles.customElmentContainer}>
      <Text style={styles.txt}>{data}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  customElmentContainer: {
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
