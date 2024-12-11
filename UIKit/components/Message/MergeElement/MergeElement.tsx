import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface IMergeElementProps {
  data: string;
}

// TODO:
export const MergeElement = (props: IMergeElementProps) => {
  const { data } = props;
  return (
    <View style={styles.mergeElmentContainer}>
      <Text style={styles.txt}>{data}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mergeElmentContainer: {
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
