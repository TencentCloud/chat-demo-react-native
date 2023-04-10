import type {PropsWithChildren} from 'react';
import React from 'react';
import {StyleSheet, View} from 'react-native';

interface MessageRowProps {
  isSelf: boolean;
}
export const MessageColunmn = <T extends MessageRowProps>(
  props: PropsWithChildren<T>,
) => {
  const {isSelf, children} = props;
  return (
    <View
      style={
        isSelf
          ? styles.messageElementColunmForSelf
          : styles.messageElementColunm
      }>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  messageElementColunm: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 8,
  },
  messageElementColunmForSelf: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginRight: 8,
  },
});
