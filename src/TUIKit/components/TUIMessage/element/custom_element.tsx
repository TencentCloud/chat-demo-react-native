import React from 'react';
import {Text} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';

export const CustomElement = (props: {message: V2TimMessage}) => {
  const {message} = props;
  console.log(message);
  return <Text>["自定义消息"]</Text>;
};
