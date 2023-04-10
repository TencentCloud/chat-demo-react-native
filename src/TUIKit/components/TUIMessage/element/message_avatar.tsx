import React from 'react';
import FastImage from 'react-native-fast-image';
import type {V2TimMessage} from 'react-native-tim-js';

export const MessageAvatar = ({message}: {message: V2TimMessage}) => {
  return (
    <FastImage
      style={{width: 40, height: 40, borderRadius: 5}}
      source={{
        uri: message.faceUrl,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );
};
