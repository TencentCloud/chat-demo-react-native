import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { formatTime } from '../../../utils';

interface ITimelineProps {
  message: IMessageModel;
}

export const Timeline = (props: ITimelineProps) => {
  const { message } = props;
  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTxt}>{formatTime(message.time * 1000, 'TIMELINE')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  timelineTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
});
