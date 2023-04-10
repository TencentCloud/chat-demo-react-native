import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  V2TimConversation,
  V2TimMessage,
  TencentImSDKPlugin,
  MessageElemType,
} from 'react-native-tim-js';
import {RootStackParamList} from '../interface';
import {getCurrentTime} from '../TUIKit';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({route, navigation}: Props) {
  const {userID} = route.params;
  const defaultFaceUrl =
    'https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png';
  const [conversationList, setConversationList] = React.useState<
    V2TimConversation[]
  >([]);
  const [cachedMessageList, setCachedMessageList] = React.useState<
    Map<string, V2TimMessage[]>
  >(new Map());
  React.useEffect(() => {
    getConversationList();
  }, []);

  const getConversationList = async () => {
    const {code, data} = await TencentImSDKPlugin.v2TIMManager
      .getConversationManager()
      .getConversationList(15, '0');
    if (code === 0) {
      setConversationList(data?.conversationList!);
    }
  };

  const getLastMessageString = (lastMessage: V2TimMessage) => {
    const {elemType, textElem} = lastMessage;
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT) {
      return textElem?.text ?? '';
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_VIDEO) {
      return '["视频消息"]';
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_IMAGE) {
      return "['图片消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_GROUP_TIPS) {
      return "['系统消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_CUSTOM) {
      return "['自定义消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_FILE) {
      return "['文件消息']";
    }

    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_FACE) {
      return "['表情消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_MERGER) {
      return "['合并消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_LOCATION) {
      return "['地理位置消息']";
    }
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_SOUND) {
      return "['语音消息']";
    }
    return '';
  };

  const renderConversationItem: ListRenderItem<V2TimConversation> = ({
    item,
  }) => {
    const {showName, faceUrl, lastMessage} = item;
    const haveFaceUrl = !!faceUrl && faceUrl !== '';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          const messageList = cachedMessageList.get(item.conversationID) ?? [];
          navigation.navigate('Chat', {
            conversation: item,
            userID: userID,
            initialMessageList: messageList,
            unMount: (message: V2TimMessage[]) => {
              setCachedMessageList(prev =>
                prev?.set(item.conversationID!, message),
              );
            },
          });
        }}>
        <View style={styles.conversationItem}>
          <FastImage
            style={{width: 48, height: 48, borderRadius: 5}}
            source={{
              uri: haveFaceUrl ? faceUrl : defaultFaceUrl,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={styles.conversationDetail}>
            <View style={styles.showNameContainer}>
              <Text style={styles.showNameText}>{showName}</Text>
              {lastMessage?.timestamp && (
                <Text style={styles.lastMsgtimeText}>
                  {getCurrentTime((lastMessage?.timestamp ?? 0) * 1000)}
                </Text>
              )}
            </View>
            <Text
              numberOfLines={1}
              lineBreakMode="middle"
              style={styles.lastMessageText}>
              {lastMessage ? getLastMessageString(lastMessage) : ' '}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fill}>
      <FlatList
        style={{flex: 1, width: '100%'}}
        data={conversationList}
        renderItem={renderConversationItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  conversationItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  conversationDetail: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  showNameText: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
  },
  showNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastMsgtimeText: {
    fontWeight: '400',
    fontSize: 12,
    color: '#BBBBBB',
  },
});

export default HomeScreen;
