import React from 'react'
import { StyleSheet, View } from "react-native";
import { MessageElemType, TencentImSDKPlugin, V2TimConversation, V2TimMessage } from "react-native-tim-js"
import { Dialog, Input, ScreenWidth, Button, ListItem, Avatar, Icon } from "@rneui/base";
import FastImage from 'react-native-fast-image';
import { getCurrentTime } from '../../utils';
interface TUIConversationItemProps {
    item:V2TimConversation,
    onConversationTap?:(conversation:V2TimConversation)=>void
}
export const TUIConversationItem = (props:TUIConversationItemProps) => {
    const {item,onConversationTap} = props;
    const { showName, faceUrl, lastMessage, conversationID, isPinned } = item;
    const haveFaceUrl = !!faceUrl && faceUrl !== "";
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
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
    const deleteConversation = (conversation:V2TimConversation) => {
        if(conversation.type == 1){
          TencentImSDKPlugin.v2TIMManager
          .getConversationManager().deleteConversation("c2c_"+conversation.conversationID);
        }else if(conversation.type == 2){
          TencentImSDKPlugin.v2TIMManager
          .getConversationManager().deleteConversation("group_"+conversation.conversationID);
        }
        
      }
    const pinConversation = async (conversationID: string, isPinned: boolean) => {
    TencentImSDKPlugin.v2TIMManager
        .getConversationManager()
        .pinConversation(conversationID, isPinned);
    };
    return (
        <ListItem.Swipeable
        bottomDivider
        onPress={()=>{
            if(onConversationTap){
                onConversationTap(item);
            }
        }}
        containerStyle={{
            marginVertical:-4,
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
            onPress={() => deleteConversation(item)}
            buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
          />
          </View>
          
        )}
      >
        <FastImage
              style={{ width: 40, height: 40, borderRadius: 5 }}
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
}

const styles = StyleSheet.create({
    fill: {
      flex: 1,
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
    lastMsgtimeText: {
        fontWeight: "400",
        fontSize: 12,
        color: "#BBBBBB",
    },
})