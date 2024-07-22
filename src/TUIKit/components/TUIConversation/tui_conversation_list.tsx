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
import { RootStackParamList } from "../../../interface";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Dialog, Input, ScreenWidth, Button, Header } from "@rneui/base";
import { TUIConversationItem } from "./tui_conversation_item";
import { useTheme } from "@rneui/themed";

interface TUIConversationListProps {
    userID:string;
    onConversationTap?:(conversation:V2TimConversation)=>void;
}

export const TUIConversationList = (props:TUIConversationListProps) => {
    const { theme } = useTheme();
    const {userID,onConversationTap} = props;
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
      setConversationList((prevState) => {
        const newConversationList = [...prevState, ...data?.conversationList!];
      const uniqueConversationList = Array.from(new Set(newConversationList.map(conversation => conversation.conversationID)))
        .map(id => newConversationList.find(conversation => conversation.conversationID === id))
        .filter(conversation => conversation !== undefined) as V2TimConversation[];
      return uniqueConversationList;
      });
    }
  };

    const createConversation = async () => {
        setVisible(true);
    };
    
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
        return TUIConversationItem({item,onConversationTap})
    }

    return (
        <View style={styles.fill}>
        <Header
        containerStyle={{
            backgroundColor: '#e1e8ee',
            paddingLeft: 20,
          }}
          centerComponent={{ text: "会话列表", style: {color: 'black',
            fontSize: 16} }}
        //   rightComponent={getRightComponent()}
        />

          <FlatList
            style={{ flex: 1, width: "100%" }}
            data={sortConversationList()}
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
    showNameContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });