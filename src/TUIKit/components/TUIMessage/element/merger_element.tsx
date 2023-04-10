import {ScreenWidth} from '@rneui/base';
import {Divider, Text, useTheme} from '@rneui/themed';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js';

export const MergerElement = (props: {
  message: V2TimMessage;
  callback?: (message: V2TimMessage) => void;
}) => {
  const {
    message: {mergerElem},
    callback,
  } = props;
  const {theme} = useTheme();

  const getAbstractList = () => {
    return mergerElem?.abstractList?.slice(0, 4) ?? [];
  };
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (callback) {
          callback!(props.message);
        }
      }}>
      <View style={styles.container}>
        <Text numberOfLines={1}>{mergerElem?.title}</Text>
        <View style={{marginVertical: 12}}>
          {getAbstractList().map(item => (
            <Text h4 style={{color: theme.colors.grey4}}>
              {item}
            </Text>
          ))}
        </View>

        <Divider style={{marginBottom: 6}} />
        <Text style={{fontSize: 10, color: theme.colors.grey4}}>聊天记录</Text>
      </View>
    </TouchableOpacity>
  );
};

export const withTapMergerElement = (
  callback: (message: V2TimMessage) => void,
) => {
  return (props: {message: V2TimMessage}) => (
    <MergerElement message={props.message} callback={callback} />
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 12,
    width: ScreenWidth * 0.4,
  },
});
