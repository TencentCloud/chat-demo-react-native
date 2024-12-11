import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

interface IPreviewInfoProps {
  title: string;
  value: string;
}

export const PreviewInfo = (props: IPreviewInfoProps) => {
  const { title, value } = props;

  return (
    <View style={styles.previewContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {title}
          </Text>
          <Image
            style={styles.closeIcon}
            source={require('../../../../../assets/close-gray.png')}
          />
        </View>
        <Text style={styles.text}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  contentContainer: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  text: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 60,
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
});
