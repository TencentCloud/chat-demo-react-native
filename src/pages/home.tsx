import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  V2TimConversation,
  V2TimMessage,
  TencentImSDKPlugin,
  MessageElemType,
} from "react-native-tim-js";
import { RootStackParamList } from "../interface";
import { getCurrentTime } from "../TUIKit";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Dialog, Input, ScreenWidth, Button } from "@rneui/base";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

function HomeScreen({ route, navigation }: Props) {
  const { userID } = route.params;
  const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";

  const [cachedMessageList, setCachedMessageList] = React.useState<
    Map<string, V2TimMessage[]>
  >(new Map());
  const [open, setOpen] = React.useState<boolean>(false);
  const [positionY, setPositionY] = React.useState<number>();
  const [handledConversationID, setConversationID] = React.useState<string>("");
  const [conversationIsPinned, setPinned] = React.useState<boolean>(false);
  const [isVisible, setVisible] = React.useState<boolean>(false);
  const [conversationList, setConversationList] = React.useState<
    V2TimConversation[]
  >([]);
  const [convID, setConvID] = React.useState<string>("");
  React.useEffect(() => {
    getConversationList();
    addConversationListChange();
  }, []);

  const handleConversationChanged = async (cList: V2TimConversation[]) => {
    setConversationList((prevState) => {
      let tmpCv: V2TimConversation[] = [];
      cList.map((item) => {
        tmpCv = prevState.map((i) => {
          if (item.conversationID === i.conversationID) {
            return item;
          } else {
            return i;
          }
        });
      });
      return tmpCv;
    });
  };

  const handleNewConversation = async (cList: V2TimConversation[]) => {
    setConversationList((prevState) => {
      return [...prevState, ...cList];
    });
  };

  const conversationListener = {
    onConversationChanged: handleConversationChanged,
    onNewConversation: handleNewConversation,
  };

  const addConversationListChange = async () => {
    TencentImSDKPlugin.v2TIMManager
      .getConversationManager()
      .addConversationListener(conversationListener);
  };

  const getConversationList = async () => {
    const { code, data } = await TencentImSDKPlugin.v2TIMManager
      .getConversationManager()
      .getConversationList(15, "0");
    if (code === 0) {
      setConversationList((prevState) => [
        ...prevState,
        ...data?.conversationList!,
      ]);
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title="发起会话"
            onPress={createConversation}
            type="clear"
            titleStyle={{ color: "rgba(78, 116, 289, 1)" }}
          />
        );
      },
    });
  }, [navigation]);

  const createConversation = async () => {
    setVisible(true);
    // const createTextMessageResponse = await TencentImSDKPlugin.v2TIMManager
    //   .getMessageManager()
    //   .createTextMessage("这是一条测试消息");
    // const { code, data } = createTextMessageResponse;
    // if (code === 0) {
    //   const sendMsgRes = await TencentImSDKPlugin.v2TIMManager
    //     .getMessageManager()
    //     .sendMessage({
    //       id: data?.id ?? "",
    //       receiver: "123456",
    //       groupID: "",
    //     });
    // }
  };

  const pinConversation = async (conversationID: string, isPinned: boolean) => {
    TencentImSDKPlugin.v2TIMManager
      .getConversationManager()
      .pinConversation(conversationID, isPinned);
  };

  const getLastMessageString = (lastMessage: V2TimMessage) => {
    const { elemType, textElem } = lastMessage;
    if (elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT) {
      return textElem?.text ?? "";
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
    return "";
  };

  const closeTooltip = Gesture.Tap().onStart(() => {
    setOpen(false);
  });

  const sortConversationList = () => {
    const tmpConv = [...conversationList];
    tmpConv.sort((a, b) => {
      if (a.isPinned && !b.isPinned) {
        return -1;
      } else if (!a.isPinned && b.isPinned) {
        return 1;
      } else {
        return (b.orderkey ?? 0) - (a.orderkey ?? 0); // 根据orderKey降序排序
      }
    });
    return tmpConv;
  };

  const renderConversationItem: ListRenderItem<V2TimConversation> = ({
    item,
  }) => {
    const { showName, faceUrl, lastMessage, conversationID, isPinned } = item;
    const haveFaceUrl = !!faceUrl && faceUrl !== "";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={(event) => {
          const absoluteY = event.nativeEvent.pageY;
          setPositionY(absoluteY);
          setConversationID(conversationID);
          setPinned(isPinned ?? false);
          setOpen(true);
        }}
        onPress={() => {
          const messageList = cachedMessageList.get(item.conversationID) ?? [];
          navigation.navigate("Chat", {
            conversation: item,
            userID: userID,
            initialMessageList: messageList,
            unMount: (message: V2TimMessage[]) => {
              setCachedMessageList((prev) =>
                prev?.set(item.conversationID!, message)
              );
            },
          });
        }}
      >
        <View
          style={{
            ...styles.conversationItem,
            backgroundColor: isPinned ? "#EDEDED" : "white",
          }}
        >
          <FastImage
            style={{ width: 48, height: 48, borderRadius: 5 }}
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
              style={styles.lastMessageText}
            >
              {lastMessage ? getLastMessageString(lastMessage) : " "}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fill}>
      <FlatList
        style={{ flex: 1, width: "100%" }}
        data={sortConversationList()}
        renderItem={renderConversationItem}
      />
      {open && (
        <Modal
          visible={open}
          transparent
          onRequestClose={() => setOpen(false)}
          animationType="fade"
        >
          <GestureDetector gesture={closeTooltip}>
            <View
              style={{
                flex: 1,
                margin: 0,
                backgroundColor: "transparent",
              }}
            >
              <View
                style={{
                  marginLeft: ScreenWidth - 100,
                  marginTop: positionY,
                  marginRight: 10,
                  backgroundColor: "white",
                  shadowColor: "#ccc",
                  shadowOffset: { width: 1, height: 2 },
                  shadowOpacity: 0.8,
                }}
              >
                <View
                  style={{
                    shadowColor: "#ccc",
                    shadowOffset: { width: 1, height: 2 },
                    shadowOpacity: 0.8,
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      pinConversation(
                        handledConversationID,
                        !conversationIsPinned
                      );
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>
                      {conversationIsPinned ? "取消置顶" : "置顶"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </GestureDetector>
        </Modal>
      )}
      <Dialog
        isVisible={isVisible}
        onBackdropPress={() => {
          setVisible(false);
          setConvID("");
        }}
        overlayStyle={{
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
          }}
        >
          <Input placeholder="输入用户ID" onChangeText={(v) => setConvID(v)} />
          <Button
            title="确定"
            onPress={() => {
              navigation.navigate("Chat", {
                conversation: {
                  conversationID: `c2c_${convID}`,
                  showName: convID,
                  userID: convID,
                  groupID: '',
                  type: 1,
                },
                userID: userID,
                initialMessageList: [],
                unMount: (message: V2TimMessage[]) => {},
              });
              setVisible(false);
            }}
            buttonStyle={{
              backgroundColor: "rgba(78, 116, 289, 1)",
              borderRadius: 3,
            }}
          />
        </View>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  conversationItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  conversationDetail: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  showNameText: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999999",
  },
  showNameContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lastMsgtimeText: {
    fontWeight: "400",
    fontSize: 12,
    color: "#BBBBBB",
  },
});

export default HomeScreen;
