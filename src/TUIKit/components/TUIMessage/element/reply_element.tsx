import {ScreenWidth} from '@rneui/base';
import {Text, useTheme} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  MessageElemType,
  TencentImSDKPlugin,
  V2TimMessage,
} from 'react-native-tim-js';
import type {MessageRepliedData} from '../../utils/message';
import {FileElement} from './file_element';
import {ImageElement} from './image_element';
import {TextElement} from './text_element';
import {VideoElement} from './video_element';

export const ReplyElement = (props: {
  message: V2TimMessage;
  RawElement?: React.ComponentType<{message: V2TimMessage}>;
}) => {
  const {theme} = useTheme();
  const [rawMessage, setRawMessage] = useState<V2TimMessage | null>();
  const {message} = props;
  const repliedMessage = JSON.parse(
    message.cloudCustomData!,
  ) as MessageRepliedData;
  const {
    messageSender: repliedMessageSender,
    messageID: repliedMessageMsgID,
    messageAbstract,
  } = repliedMessage.messageReply;

  useEffect(() => {
    if (repliedMessageMsgID) {
      TencentImSDKPlugin.v2TIMManager
        .getMessageManager()
        .findMessages([repliedMessageMsgID])
        .then(response => {
          const {code, data} = response;
          if (code === 0 && data) {
            setRawMessage(data[0]);
          }
        });
    }
  }, [repliedMessageMsgID]);

  const getRawElement = (rawMessage: V2TimMessage) => {
    if (rawMessage.elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT) {
      return <TextElement message={rawMessage} isReplyMessage />;
    }
    if (rawMessage.elemType === MessageElemType.V2TIM_ELEM_TYPE_IMAGE) {
      return <ImageElement message={rawMessage} isReplyMessage />;
    }
    if (rawMessage.elemType === MessageElemType.V2TIM_ELEM_TYPE_VIDEO) {
      return <VideoElement message={rawMessage} isReplyMessage />;
    }
    if (rawMessage.elemType === MessageElemType.V2TIM_ELEM_TYPE_FILE) {
      return <FileElement message={rawMessage} isReplyMessage />;
    }
    return abstractMessage();
  };

  const abstractMessage = () => {
    return (
      <Text h4 style={{color: theme.colors.grey4}}>
        {messageAbstract}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.rawContainer}>
        <Text
          style={{color: theme.colors.grey4, fontSize: 12, fontWeight: '500'}}>
          {repliedMessageSender}
        </Text>
        <View style={{marginTop: 12, marginBottom: 4}}>
          {rawMessage ? getRawElement(rawMessage) : abstractMessage()}
        </View>
      </View>
      <Text h3>{message.textElem?.text}</Text>
    </View>
  );
};

export const withRawElementForReplyMessage = (
  rawElement: React.ComponentType<{message: V2TimMessage}>,
) => {
  return (props: {message: V2TimMessage}) => (
    <ReplyElement message={props.message} RawElement={rawElement} />
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: ScreenWidth * 0.6,
  },
  rawContainer: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    minWidth: 120,
    backgroundColor: 'rgba(68, 68, 68, 0.05)',
    borderLeftColor: 'rgba(68, 68, 68, 0.1)',
    borderLeftWidth: 2,
    marginBottom: 4,
  },
});
