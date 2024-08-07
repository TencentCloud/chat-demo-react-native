import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  V2TimConversation,
  V2TimMessage,
  TencentImSDKPlugin,
  MessageElemType,
  V2TimFriendInfo,
  V2TimGroupInfo,
} from "react-native-tim-js";
import { RootStackParamList } from "../interface";
import { getCurrentTime } from "../TUIKit";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Dialog, Input, ScreenWidth, Button, ListItem, Avatar, Icon, Tab, TabView, ScreenHeight } from "@rneui/base";
import { TUIConversationList } from "../TUIKit/components/TUIConversation";
import { TUIFriendList } from "../TUIKit/components/TUIFriend/tui_friend_list";
import { V2TimFriendApplication } from "react-native-tim-js/lib/typescript/src/interface/v2TimFriendApplication";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    getConversationList();
    addConversationListChange();
  }, []);

  const handleConversationChanged = async (cList: V2TimConversation[]) => {
    // console.log("conversation changed")
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
      
      setConversationList((prevState) => {
        const newConversationList = [...prevState, ...data?.conversationList!];
      const uniqueConversationList = Array.from(new Set(newConversationList.map(conversation => conversation.conversationID)))
        .map(id => newConversationList.find(conversation => conversation.conversationID === id))
        .filter(conversation => conversation !== undefined) as V2TimConversation[];
      return uniqueConversationList;
      });
    }
  };

  // React.useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => {
  //       return (
  //         <Button
  //           title="发起会话"
  //           onPress={createConversation}
  //           type="clear"
  //           titleStyle={{ color: "rgba(78, 116, 289, 1)" }}
  //         />
  //       );
  //     },
  //   });
  // }, [navigation]);

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
    console.log("conversationList length "+ conversationList.length);
    const tmpConv = [...conversationList];
    console.log("tmpconv length "+ tmpConv.length);
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

  const deleteConversation = (convID:string) => {
    TencentImSDKPlugin.v2TIMManager
      .getConversationManager().deleteConversation(convID);
  }
  const renderConversationItem: ListRenderItem<V2TimConversation> = ({
    item,
  }) => {
    
    const { showName, faceUrl, lastMessage, conversationID, isPinned } = item;
    const haveFaceUrl = !!faceUrl && faceUrl !== "";
    return (
      <ListItem.Swipeable
      bottomDivider
      onPress={()=>{
        console.log("on pressed!!!!!")
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
      containerStyle={{
        marginHorizontal: -6,
        backgroundColor: isPinned ? "#EDEDED" : "white",
      }}
      rightWidth={isPinned?ScreenWidth/3:ScreenWidth / 4}
      rightContent={(reset) => (
        <View style={{ flexDirection: 'row',width:"100%" }}>
          <Button
          title={isPinned? "取消置顶":"置顶"}
          onPress={() => {pinConversation(conversationID,!isPinned)}}
          buttonStyle={{ minHeight: '100%', backgroundColor: 'blue' }}
        />
        <Button
          title="删除"
          onPress={() => reset()}
          buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
        />
        </View>
        
      )}
    >
      <FastImage
            style={{ width: 48, height: 48, borderRadius: 5 }}
            source={{
              uri: haveFaceUrl ? faceUrl : defaultFaceUrl,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
    <ListItem.Content>
      <ListItem.Title style={styles.showNameText}>{showName}</ListItem.Title>
      
      <ListItem.Subtitle style={styles.lastMessageText} ellipsizeMode={"tail"} numberOfLines={1} >{lastMessage ? getLastMessageString(lastMessage) : " "}</ListItem.Subtitle>
    </ListItem.Content>
        {lastMessage?.timestamp &&( <ListItem.Content right>
          <ListItem.Title right style={styles.lastMsgtimeText}>
            {getCurrentTime((lastMessage?.timestamp ?? 0) * 1000)}
          </ListItem.Title>
        </ListItem.Content>)}
    </ListItem.Swipeable>
          
    );
  };

  const onConversationTap = (conversation:V2TimConversation) => {
      const messageList = cachedMessageList.get(conversation.conversationID) ?? [];
            navigation.navigate("Chat", {
              conversation: conversation,
              userID: userID,
              initialMessageList: messageList,
              unMount: (message: V2TimMessage[]) => {
                setCachedMessageList((prev) =>
                  prev?.set(conversation.conversationID!, message)
                );
              },
            });
  }

  const onFriendTap = (friend:V2TimFriendInfo) => {
    const messageList = cachedMessageList.get("c2c_"+friend.userID) ?? [];
    navigation.navigate("Chat", {
      conversation: {
        conversationID: "c2c_"+friend.userID,
        showName: friend.friendRemark!=""?friend.friendRemark:friend.userID,
        userID: friend.userID,
        groupID: '',
        type: 1,
      },
      userID: friend.userID,
      initialMessageList: messageList,
      unMount: (message: V2TimMessage[]) => {
        setCachedMessageList((prev) =>
          prev?.set("c2c_"+friend.userID!, message)
        );
      },
    });
  }

  const onGroupTap = (group:V2TimGroupInfo) => {
    const messageList = cachedMessageList.get("group_"+group.groupID) ?? [];
    navigation.navigate("Chat", {
      conversation: {
        conversationID: "group_"+group.groupID,
        showName: group.groupName!=""?group.groupName:group.groupID,
        userID: '',
        groupID: group.groupID,
        type: 2,
      },
      userID: userID,
      initialMessageList: messageList,
      unMount: (message: V2TimMessage[]) => {
        setCachedMessageList((prev) =>
          prev?.set("group_"+group.groupID!, message)
        );
      },
    });
  }

  const onGroupListTap = (groupList:V2TimGroupInfo[])=>{
    navigation.navigate("GroupList",{
      groupList,
      onGroupTap
    });
  }

  const onBlockListTap = (blockList:V2TimFriendInfo[])=>{
    navigation.navigate("BlockList",{
      blockList,
    })
  }

  const onFriendApplicationTap = (applicationList:V2TimFriendApplication[])=>{
    navigation.navigate("FriendApplicationList",{
      applicationList,
    })
  }

  return (
  <SafeAreaProvider>
    <View style={{height:'100%'}}>
    {/* <TabView value={index} onChange={setIndex} animationType="spring" >
      <TabView.Item style={{width: '100%' }}> */}
          
          <TUIConversationList userID={userID} onConversationTap={onConversationTap}></TUIConversationList>
      {/* </TabView.Item>

      <TabView.Item style={{ width: '100%' }}>
        <TUIFriendList onFriendTap={onFriendTap} onGroupListTap={onGroupListTap} onBlockListTap={onBlockListTap} onApplicationListTap={onFriendApplicationTap}></TUIFriendList>
      </TabView.Item>
      
      <TabView.Item style={{ backgroundColor: 'green', width: '100%' }}>
        <Text>Cart</Text>
      </TabView.Item>
    </TabView>
    <Tab
      value={index}
      onChange={(e) => setIndex(e)}
      indicatorStyle={{
        backgroundColor: 'blue',
        height: 4,
      }}
    >
      <Tab.Item
        title="会话"
        titleStyle={{ fontSize: 12,color:'black' }}
        // containerStyle={(active) => ({
        //   backgroundColor: active ? "#809AB3" : undefined,
        // })}
      />
      <Tab.Item
        title="好友"
        titleStyle={{ fontSize: 12,color:'black' }}
        // containerStyle={(active) => ({
        //   backgroundColor: active ? "#809AB3" : undefined,
        // })}
      />
      <Tab.Item
        title="设置"
        titleStyle={{ fontSize: 12,color:'black' }}
        // containerStyle={(active) => ({
        //   backgroundColor: active ? "#809AB3" : undefined,
        // })}
      />
    </Tab> */}
  </View>
  </SafeAreaProvider>
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
