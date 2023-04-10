import {Text, useTheme} from '@rneui/themed';
import React from 'react';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';

export const InnerTextElement = (props: {
  message: V2TimMessage;
  isReplyMessage?: boolean;
}) => {
  const {
    message: {textElem},
    isReplyMessage,
  } = props;
  const {theme} = useTheme();
  const text = textElem?.text;

  return (
    <View>
      {isReplyMessage ? (
        <Text h4 style={{color: theme.colors.grey4}}>
          {text}
        </Text>
      ) : (
        <Text h3 style={{color: theme.colors.black}}>
          {text}
        </Text>
      )}
    </View>
  );
};

export const TextElement = React.memo(
  InnerTextElement,
) as unknown as typeof InnerTextElement;
