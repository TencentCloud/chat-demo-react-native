import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

interface IFileElementProps {
  data: Record<string, string>;
}

export const FileElement = (props: IFileElementProps) => {
  const { data } = props;

  const getFileExt = () => {
    return data.name.split('.')[1];
  };

  return (
    <View style={styles.fileElmentContainer}>
      <View style={styles.fileContainer}>
        <Image
          style={styles.fileIcon}
          source={require('../../../assets/msg-file-icon.png')}
        />
        <Text
          style={styles.fileName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {data.name}
        </Text>
      </View>
      <Text style={styles.fileSize}>{`${data.size}.${getFileExt()}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fileElmentContainer: {
    flexShrink: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fileContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  fileName: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    marginTop: 8,
    marginLeft: 12,
    color: '#7A7A7A',
    fontSize: 12,
  },
});
