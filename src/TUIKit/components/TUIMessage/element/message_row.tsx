import type {PropsWithChildren} from 'react';
import React from 'react';
import {StyleSheet, View} from 'react-native';

interface MessageRowProps {
  isSelf: boolean;
}
export const MessageRow = <T extends MessageRowProps>(
  props: PropsWithChildren<T>,
) => {
  const {isSelf, children} = props;
  return (
    <View style={isSelf ? styles.messageRowForSelf : styles.messageRow}>
      <View
        style={isSelf ? styles.messageElementForSelf : styles.messageElement}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingLeft: 15,
  },
  messageRowForSelf: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingRight: 15,
  },
  messageElement: {
    display: 'flex',
    flexDirection: 'row',
  },
  messageElementForSelf: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
});
