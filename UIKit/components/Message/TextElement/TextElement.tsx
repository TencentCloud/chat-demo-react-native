import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

interface ITextElementProps {
  data: Record<string, Record<string, string>[]>;
}

export const TextElement = (props: ITextElementProps) => {
  const { data } = props;

  return (
    <View style={styles.textElementContainer}>
      {data.text.map((item, index) => {
        return item.name === 'text'
          ? (
              <Text
                key={index}
                style={styles.txt}
              >
                {item.text}
              </Text>
            )
          : item.name === 'img'
            ? (
                <Image
                  key={index}
                  style={styles.emoji}
                  source={{ uri: item.src }}
                />
              )
            : null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  textElementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 10,
  },
  txt: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
  },
  emoji: {
    width: 20,
    height: 20,
  },
});
