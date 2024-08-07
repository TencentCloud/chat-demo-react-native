import { ListItem } from "@rneui/base";
import React from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import FastImage from "react-native-fast-image";
import { TencentImSDKPlugin, V2TimConversation } from "react-native-tim-js";

interface MessageReceiverProps{
    selectConversationCallback:(conversation:V2TimConversation)=>void;
}
export const MergeMessageReceiver = (props:MessageReceiverProps)=>{
    const [conversationList, setConversationList] = React.useState<
    V2TimConversation[]
     >([]);
     const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
     React.useEffect(() => {
        getConversationList();
      }, []);
    const getConversationList = async () => {
        const { code, data } = await TencentImSDKPlugin.v2TIMManager
          .getConversationManager()
          .getConversationList(30, "0");
          console.log("code",code);
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
    const sortConversationList = () => {
        const tmpConv = [...conversationList];
        console.log("conversation length sort",conversationList.length);
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
    const renderConversationItem:ListRenderItem<V2TimConversation> = ({item})=>{
        return(
        <ListItem 
        onPress={()=>{
            console.log(item.conversationID)
            props.selectConversationCallback(item);
        }}
        
        >
             <FastImage
              style={{ width: 30, height: 30, borderRadius: 5 }}
              source={{
                uri: item.faceUrl ? item.faceUrl : defaultFaceUrl,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
            <ListItem.Content>
                <ListItem.Title>{item.showName}</ListItem.Title>
            </ListItem.Content>
        </ListItem>
    );}
    return(
        <View style={{flex:1,backgroundColor:'white'}}>
            <FlatList
            style={{ flex: 1, width: "100%" }}
            data={sortConversationList()}
            renderItem={renderConversationItem}
          />
        </View>
    );
}