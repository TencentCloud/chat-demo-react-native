import {Image, Text, useTheme} from '@rneui/themed';
import React from 'react';
import {Pressable} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Animated, LayoutChangeEvent, View, ViewStyle} from 'react-native';
import {styles} from './styles';
import {useTUIChatContext} from '../../store';
import {MessageService} from './message_service';
import {useLoginUser} from '../../hooks/useLoginUser';
import DocumentPicker from 'react-native-document-picker';
import {ScreenWidth} from '@rneui/base';
import {createThumbnail} from 'react-native-create-thumbnail';

interface TUIMessageToolBoxProps {
  onLayout: (event: LayoutChangeEvent) => void;
  style: Animated.WithAnimatedObject<ViewStyle>;
  convID: string;
  convType: number;
  loginUserID: string;
}

export const TUIMessageToolBox = (props: TUIMessageToolBoxProps) => {
  const {convID, convType, loginUserID} = props;
  const {theme} = useTheme();
  const {dispatch} = useTUIChatContext();
  const loginUserInfo = useLoginUser(loginUserID);
  const messageService = new MessageService(dispatch, {
    userInfo: loginUserInfo,
    convID,
    convType,
  });
  const toolBoxItemMap = [
    {
      name: '拍照',
      id: 'camera',
      icon: require('../../../assets/screen.png'),
    },
    {
      name: '照片',
      id: 'photo',
      icon: require('../../../assets/photo.png'),
    },
    {
      name: '文件',
      id: 'file',
      icon: require('../../../assets/file.png'),
    },
  ];

  const handleToolBoxItemPress = async (id: string) => {
    if (id === 'camera') {
      const result = await launchCamera({
        mediaType: 'mixed',
        maxHeight: 256,
        presentationStyle: 'fullScreen',
      });
      const {assets} = result;
      if (assets) {
        const {uri, width, height, type, duration, fileName} = assets[0]!;
        if (type === 'video/quicktime') {
          const formatedUri = uri!.replace(/file:\/\//, '');
          const {
            path,
            width: snapshotWidth,
            height: snapshotHeight,
          } = await createThumbnail({
            url: formatedUri,
          });
          console.log('snapshotPath', path);
          const videoType = fileName?.split('.') ?? [];
          messageService.sendVideoMessage(
            formatedUri,
            duration ?? 0,
            path,
            videoType[1],
            snapshotWidth,
            snapshotHeight,
          );
        } else {
          const formatedUri = uri!.replace(/file:\/\//, '');
          messageService.sendImageMessage(formatedUri, width ?? 0, height ?? 0);
        }
      }
    }
    if (id === 'photo') {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        presentationStyle: 'fullScreen',
      });
      const {assets} = result;
      if (assets && assets.length !== 0) {
        if (assets[0]) {
          const {uri, width, height} = assets[0]!;
          if (uri) {
            const formatedUri = uri.replace(/file:\/\//, '');
            messageService.sendImageMessage(
              formatedUri,
              width ?? 0,
              height ?? 0,
            );
          }
        }
      }
    }
    if (id === 'file') {
      try {
        const result = await DocumentPicker.pickSingle({
          mode: 'open',
          presentationStyle: 'fullScreen',
          copyTo: 'cachesDirectory',
          type: DocumentPicker.types.allFiles,
        });
        const {uri, name, fileCopyUri} = result;
        console.log(uri, name, fileCopyUri);
        const formatedUri = fileCopyUri!.replace(/file:\/\//, '');
        messageService.sendFileMessage(formatedUri, name ?? '');
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Animated.View
      style={[styles.absolute, props.style]}
      onLayout={props.onLayout}>
      <View style={styles.toolbox}>
        {toolBoxItemMap.map(item => (
          <Pressable
            key={item.id}
            style={[
              styles.toolBoxItem,
              {marginLeft: (ScreenWidth - 64 * 4) / 5},
            ]}
            onPress={() => {
              handleToolBoxItemPress(item.id);
            }}>
            <Image style={styles.toolBoxImg} source={item.icon} />
            <Text h4 style={{color: theme.colors.grey4}}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
};
