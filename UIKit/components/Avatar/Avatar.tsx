import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { handleImageUrl } from './utils';
import { USER_AVATAR_DEFAULT } from '../../constant';

interface IAvatarProps {
  uri: string;
  size?: number;
  radius?: number;
  styles?: Record<string, number | string>;
}

export const Avatar = (props: IAvatarProps) => {
  const {
    uri = '',
    size = 40,
    radius = 20,
    styles = {},
  } = props;

  const [imageUrl, setImageUrl] = useState<string>('');

  const onImageError = () => {
    setImageUrl(USER_AVATAR_DEFAULT);
  };

  return (
    <View
      style={[
        _styles.imageContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        styles,
      ]}
    >
      <Image
        style={_styles.image}
        source={{ uri: imageUrl ? imageUrl : handleImageUrl(uri) }}
        onError={onImageError}
      />
    </View>
  );
};

const _styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    backgroundColor: '#F2F7FF',
  },
  image: {
    flex: 1,
  },
});
