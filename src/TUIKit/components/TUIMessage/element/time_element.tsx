import {makeStyles, Text} from '@rneui/themed';
import React from 'react';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';
import {getCurrentTime} from '../../../utils/time';

export const TimeElement = (props: {message: V2TimMessage}) => {
  const {
    message: {timestamp},
  } = props;
  const timeString = getCurrentTime((timestamp ?? 0) * 1000);
  const styles = useStyles();
  return (
    <View style={styles.text}>
      <Text h4 style={{color: styles.text.color}}>
        {timeString}
      </Text>
    </View>
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    display: 'flex',
    alignItems: 'center',
    color: theme.colors.grey4,
    marginTop: 20,
    marginBottom: 20,
  },
}));
