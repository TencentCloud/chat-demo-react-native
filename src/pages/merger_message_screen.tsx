import React from 'react';
import {TUIMergeMessageScreen} from '../TUIKit';
import type {V2TimMessage} from 'react-native-tim-js';
import {RootStackParamList} from '../interface';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'MergerMessageScreen'>;

export const MergerMessageScreen = ({route}: Props) => {
  const message = route.params.message as V2TimMessage;
  return <TUIMergeMessageScreen message={message} />;
};
