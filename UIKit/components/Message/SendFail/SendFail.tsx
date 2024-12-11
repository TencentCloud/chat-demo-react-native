import React from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';

interface ISendFailProps {
  message: IMessageModel;
}

export const SendFail = (props: ISendFailProps) => {
  const { message } = props;
  if (message.flow === 'out' && message.status === 'fail') {
    return (
      <View style={styles.sendFail}>
        <Image
          style={styles.sendFialIcon}
          source={require('../../../assets/send-fail.png')}
        />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  sendFail: {
    alignSelf: 'center',
    marginLeft: 2,
  },
  sendFialIcon: {
    width: 14,
    height: 14,
  },
});
