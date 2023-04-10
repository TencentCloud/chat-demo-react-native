import {ThemeProvider, Text} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {
  MessageElemType,
  TencentImSDKPlugin,
  V2TimMessage,
} from 'react-native-tim-js';
import {tuiChatTheme} from '../../theme';
import {MessageUtils} from '../../utils/message';
import {
  AudioElement,
  CustomElement,
  FaceElement,
  FileElement,
  GroupTipsElement,
  ImageElement,
  LocationElement,
  MergerElement,
  MessageAvatar,
  MessageBubble,
  MessageColunmn,
  MessageRow,
  ReplyElement,
  TextElement,
  VideoElement,
} from '../TUIMessage/element';

export const TUIMergeMessageScreen = (props: {message: V2TimMessage}) => {
  const [messageList, setMessageList] = useState<V2TimMessage[]>([]);

  useEffect(() => {
    const downloadMergeMessageList = async (msgID: string) => {
      const {code, data} = await TencentImSDKPlugin.v2TIMManager
        .getMessageManager()
        .downloadMergerMessage(msgID);
      if (code === 0 && data) {
        setMessageList(data);
      }
    };

    if (props.message.msgID) {
      downloadMergeMessageList(props.message.msgID);
    }
  }, [props.message]);

  const getMessageElement = (message: V2TimMessage) => {
    const elementType = message.elemType ?? 0;
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_TEXT) {
      if (MessageUtils.isReplyMessage(message)) {
        return <ReplyElement message={message} />;
      }
      return <TextElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_IMAGE) {
      return <ImageElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_SOUND) {
      return <AudioElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_VIDEO) {
      return <VideoElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_FILE) {
      return <FileElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_CUSTOM) {
      return <CustomElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_FACE) {
      return <FaceElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_LOCATION) {
      return <LocationElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_MERGER) {
      return <MergerElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_GROUP_TIPS) {
      return <GroupTipsElement message={message} />;
    }
    return <Text>["未知消息"]</Text>;
  };

  const renderItem: ListRenderItem<V2TimMessage> = ({item}) => {
    return (
      <View style={styles.item}>
        <MessageRow isSelf={false}>
          <MessageAvatar message={item} />
          <MessageColunmn isSelf={false}>
            <Text h4 style={styles.text}>
              {item.nickName ?? item.userID ?? ''}
            </Text>
            <MessageBubble message={item}>
              {getMessageElement(item)}
            </MessageBubble>
          </MessageColunmn>
        </MessageRow>
      </View>
    );
  };

  return (
    <ThemeProvider theme={tuiChatTheme}>
      <View style={styles.container}>
        {messageList.length === 0 ? (
          <View></View>
        ) : (
          <FlatList data={messageList} renderItem={renderItem} />
        )}
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#999999',
    marginBottom: 4,
  },
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
  },
  itemDetail: {
    marginLeft: 12,
    display: 'flex',
    justifyContent: 'flex-start',
  },
});
