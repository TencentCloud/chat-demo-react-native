/* eslint-disable react-native/no-inline-styles */
import {Image, Text, useTheme} from '@rneui/themed';
import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, StyleSheet, View, Animated} from 'react-native';
import RNFS from 'react-native-fs';
import type {V2TimMessage} from 'react-native-tim-js';
import {MessageDownload} from '../../../utils/message_download';
import {updateMessageProgress, useTUIChatContext} from '../../../store';
import FileViewer from 'react-native-file-viewer';
import FastImage from 'react-native-fast-image';

const FileIcon = (props: {fileFormat: string}) => {
  const {fileFormat} = props;
  const fileMap = new Map<string, string>([
    ['doc', 'word.png'],
    ['docx', 'word.png'],
    ['ppt', 'ppt.png'],
    ['pptx', 'ppt.png'],
    ['xls', 'excel.png'],
    ['xlsx', 'excel.png'],
    ['pdf', 'pdf.png'],
    ['zip', 'zip.png'],
    ['rar', 'zip.png'],
    ['7z', 'zip.png'],
    ['tar', 'zip.png'],
    ['gz', 'zip.png'],
    ['xz', 'zip.png'],
    ['bz2', 'zip.png'],
    ['txt', 'txt.png'],
    ['jpg', 'image_icon.png'],
    ['bmp', 'image_icon.png'],
    ['gif', 'image_icon.png'],
    ['png', 'image_icon.png'],
    ['jpeg', 'image_icon.png'],
    ['tif', 'image_icon.png'],
    ['wmf', 'image_icon.png'],
    ['dib', 'image_icon.png'],
  ]);

  const getFileIconString = () => {
    const key = fileFormat.toLocaleLowerCase();
    const iconName = fileMap.get(key);
    if (iconName === 'word.png') {
      return require('../../../../assets/word.png');
    }
    if (iconName === 'ppt.png') {
      return require('../../../../assets/ppt.png');
    }
    if (iconName === 'excel.png') {
      return require('../../../../assets/excel.png');
    }
    if (iconName === 'pdf.png') {
      return require('../../../../assets/pdf.png');
    }
    if (iconName === 'zip.png') {
      return require('../../../../assets/zip.png');
    }
    if (iconName === 'txt.png') {
      return require('../../../../assets/txt.png');
    }
    if (iconName === 'image_icon.png') {
      return require('../../../../assets/image_icon.png');
    }
    return require('../../../../assets/unknown.png');
  };

  return (
    <Image
      ImageComponent={FastImage}
      source={getFileIconString()}
      style={styles.fileIconContainer}
    />
  );
};

export const FileElement = (props: {
  message: V2TimMessage;
  isReplyMessage?: boolean;
}) => {
  // const [count, setCount] = useState(0);
  const loaderValue = useRef(new Animated.Value(0)).current;
  const {message, isReplyMessage} = props;
  const {theme} = useTheme();
  const {dispatch} = useTUIChatContext();
  const isSelf = message.isSelf ?? false;
  const fileName = message.fileElem?.fileName ?? '';
  const fileSize = message.fileElem?.fileSize ?? 0;
  const fileFormat =
    fileName.split('.')[Math.max(fileName.split('.').length - 1, 0)] ?? '';
  const filePath = message.fileElem?.localUrl ?? '';
  const progress = message.progress ?? 0;

  const showFileSize = () => {
    if (fileSize < 1024) {
      return fileSize.toString() + 'B';
    } else if (fileSize < 1024 * 1024) {
      return (fileSize / 1024).toFixed(2) + 'KB';
    } else if (fileSize < 1024 * 1024 * 1024) {
      return (fileSize / 1024 / 1024).toFixed(2) + 'MB';
    } else {
      return (fileSize / 1024 / 1024 / 1024).toFixed(2) + 'GB';
    }
  };

  useEffect(() => {
    RNFS.exists(filePath).then(isExit => {
      if (isExit && progress !== 1) {
        dispatch(
          updateMessageProgress({
            msgID: message.msgID!,
            progress: 1,
          }),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  const tabHandler = () => {
    console.log('press');
    RNFS.exists(filePath).then(isExit => {
      if (isExit) {
        FileViewer.open(filePath, {showOpenWithDialog: true}) // absolute-path-to-my-local-file.
          .then(() => {
            console.log('open success');
          })
          .catch(error => {
            console.log('open file error', error);
          });
      } else {
        console.log('加入下载队列');
        if (message.msgID) {
          MessageDownload.addTask(message.msgID);
        }
      }
    });
  };

  useEffect(() => {
    const load = (count: number) => {
      Animated.timing(loaderValue, {
        toValue: count, //final value
        duration: 300, //update value in 500 milliseconds
        useNativeDriver: false,
      }).start();
    };
    load(progress);
  }, [loaderValue, progress]);

  const width = loaderValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity onPress={tabHandler} activeOpacity={0.8}>
      <View
        style={{
          width: isReplyMessage ? 190 : 237,
          height: isReplyMessage ? 50 : 63,
          backgroundColor:
            progress === 1
              ? theme.colors.secondary
              : isReplyMessage
              ? theme.colors.white
              : theme.colors.primary,
          borderTopLeftRadius: isSelf ? 10 : 2,
          borderTopRightRadius: isSelf ? 2 : 10,
          borderBottomRightRadius: 10,
          borderBottomLeftRadius: 10,
        }}>
        <Animated.View
          style={{
            backgroundColor:
              progress === 1 ? theme.colors.secondary : theme.colors.primary,
            width,
            height: isReplyMessage ? 50 : 63,
            borderTopLeftRadius: isSelf ? 10 : 2,
            borderTopRightRadius: isSelf ? 2 : 10,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        />
        <View
          style={{
            ...styles.fileContainer,
            flexDirection: isSelf ? 'row-reverse' : 'row',
            paddingTop: isReplyMessage ? 10 : 15,
          }}>
          <FileIcon fileFormat={fileFormat} />
          <View style={{...styles.fileDetail, marginLeft: isSelf ? 0 : 12}}>
            <Text numberOfLines={1} ellipsizeMode="middle">
              {fileName}
            </Text>
            <Text h3 style={{color: theme.colors.grey4, fontWeight: '400'}}>
              {showFileSize()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fileContainer: {
    position: 'absolute',
    display: 'flex',
    paddingBottom: 15,
    paddingLeft: 12,
    paddingRight: 12,
  },
  fileDetail: {
    flex: 1,
    marginLeft: 12,
  },
  fileIconContainer: {
    width: 32,
    height: 32,
  },
});
