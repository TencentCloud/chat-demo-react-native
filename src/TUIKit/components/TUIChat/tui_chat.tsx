import { ThemeProvider } from "@rneui/themed";
import React, { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { Animated, findNodeHandle, Image, Pressable, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TencentImSDKPlugin, V2TimConversation, type V2TimMessage } from "react-native-tim-js";
import { useMessageList } from "../../hooks/useMessageList";
import { TUIChatAction, TUIChatContextProvider, deleteMessage, useTUIChatContext } from "../../store";
import { tuiChatTheme } from "../../theme";
import { TUIChatHeader } from "../TUIChatHeader";
import {
  AudioElement,
  composeKeyboardHeightWithMessageBubble,
  CustomElement,
  FaceElement,
  FileElement,
  GroupTipsElement,
  ImageElement,
  LocationElement,
  ReplyElement,
  TextElement,
  TimeElement,
  VideoElement,
  withEditableRevokeMessage,
  withTapMergerElement,
} from "../TUIMessage/element";
import { withElement } from "../TUIMessage/tui_message";
import {
  TUIMessageInput,
  TUIMessageInputRef,
} from "../TUIMessageInput/tui_message_input";
import { TUIMessageList, TUIMessageListRef } from "../TUIMessageList";
import {
  KeyboardInsetsView,
  getEdgeInsetsForView,
} from "react-native-keyboard-insets";
import { ViewDriver } from "./driver/viewDriver";
import type { Driver } from "./driver/driver";
import { KeyboardDriver } from "./driver/keyboardDriver";
import { TUIMessageEmoji } from "../TUIMessageInput/tui_message_emoji";
import { TUIMessageToolBox } from "../TUIMessageInput/tui_message_tool_box";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import type { TUIChatProps } from "../../interface";
import { MessageAvatar } from "../TUIMessage/element/message_avatar";
import { Dialog, Overlay, ScreenHeight, ScreenWidth } from "@rneui/base";
import { MergeMessageReceiver } from "./merge_message_receiver";
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const TUIChat = (props: TUIChatProps) => {
  const {
    conversation: { showName, faceUrl },
    showChatHeader,
    initialMessageList,
  } = props;

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider theme={tuiChatTheme}>
          <View style={styles.container}>
            {showChatHeader && (
              <TUIChatHeader title={showName} avatarUrl={faceUrl} />
            )}
            <TUIChatContextProvider initialMesage={initialMessageList}>
              <MessageViewWithInput {...props} />
            </TUIChatContextProvider>
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const MessageViewWithInput = (props: TUIChatProps) => {
  // const { top } = useSafeAreaInsets();
  const {
    conversation,
    loginUserID,
    unMount,
    messageItemOption,
    textInputOption,
    onMergeMessageTap,
  } = props;
  const { loadMore } = useMessageList(conversation);
  const { userID, groupID, type } = conversation;
  const convID = type === 1 ? userID : groupID;
  const tuiMessageInputRef = useRef<TUIMessageInputRef>(null);
  const tuiMessageListRef = useRef<TUIMessageListRef>(null);
  const senderRef = useRef<View>(null);
  const [bottom, setBottom] = useState(25);
  const emoji = useRef(new ViewDriver("emoji")).current;
  const toolbox = useRef(new ViewDriver("toolbox")).current;
  const keyboard = useRef(new KeyboardDriver(tuiMessageInputRef)).current;
  const [driver, setDriver] = useState<Driver>();
  const [translateY, setTranslateY] = useState(new Animated.Value(0));
  const [translateMLY, setTranslateMLY] = useState(new Animated.Value(0));
  const [isSelectMode,setSelectMode] = useState(false);
  const [showShareDialog,setShowShareDialog] = useState(false);
  const [showConfirmDialog,setShowConfirmDialog] = useState(false);
  const [selected_conversation,setSelectedConversation] = useState<V2TimConversation>({conversationID:''});
  const [selectedList,setSelectedList] = useState<string[]>([]);
  const driverState = {
    bottom,
    driver,
    setDriver,
    setTranslateY,
    setTranslateMLY,
  };

  const handleMessageEditable = useCallback((message: V2TimMessage) => {
    const text = message.textElem?.text;
    if (text) {
      tuiMessageInputRef.current?.addTextValue(text);
      tuiMessageInputRef.current?.getTextInputRef().current?.focus();
      // tuiMessageInputRef.current?.hanldeSubmiting();
    }
  }, []);

  const handleMergeMessageTab = useCallback(
    (message: V2TimMessage) => {
      if (onMergeMessageTap) {
        onMergeMessageTap(message);
      }
    },
    [onMergeMessageTap]
  );

  const MessageElement = useMemo(
    () =>
      withElement({
        TextElement: messageItemOption?.TextElement ?? TextElement,
        MessageBubble:
          messageItemOption?.MessageBubble ??
          composeKeyboardHeightWithMessageBubble(336),
        TimeElement: messageItemOption?.TimeElement ?? TimeElement,
        ImageElement: messageItemOption?.ImageElement ?? ImageElement,
        AudioElement: messageItemOption?.AudioElement ?? AudioElement,
        FileElement: messageItemOption?.FileElement ?? FileElement,
        RevokeElement:
          messageItemOption?.RevokeElement ??
          withEditableRevokeMessage(handleMessageEditable),
        VideoElement: messageItemOption?.VideoElement ?? VideoElement,
        ReplyElement: messageItemOption?.ReplyElement ?? ReplyElement,
        CustomElement: messageItemOption?.CustomElement ?? CustomElement,
        FaceElement: messageItemOption?.FaceElement ?? FaceElement,
        LocationElement: messageItemOption?.LocationElement ?? LocationElement,
        GroupTipsElement:
          messageItemOption?.GroupTipsElement ?? GroupTipsElement,
        MergerElement:
          messageItemOption?.MergerElement ??
          withTapMergerElement(handleMergeMessageTab),
        MessageAvatar: messageItemOption?.MessageAvatar ?? MessageAvatar,
        showAvatar: messageItemOption?.showAvatar,
        showNickName: messageItemOption?.showNickName,
      }),
    [
      messageItemOption?.TextElement,
      messageItemOption?.MessageBubble,
      messageItemOption?.TimeElement,
      messageItemOption?.ImageElement,
      messageItemOption?.AudioElement,
      messageItemOption?.FileElement,
      messageItemOption?.RevokeElement,
      messageItemOption?.VideoElement,
      messageItemOption?.ReplyElement,
      messageItemOption?.CustomElement,
      messageItemOption?.FaceElement,
      messageItemOption?.LocationElement,
      messageItemOption?.GroupTipsElement,
      messageItemOption?.MergerElement,
      messageItemOption?.MessageAvatar,
      messageItemOption?.showAvatar,
      messageItemOption?.showNickName,
      handleMessageEditable,
      handleMergeMessageTab,
    ]
  );

  const onLoadMore = useCallback(
    (id: string) => {
      loadMore({
        userID,
        groupID,
        lastMsgID: id,
      });
    },
    [userID, groupID, loadMore]
  );

  const onLayout = useCallback(() => {
    const viewTag = findNodeHandle(senderRef.current);
    if (viewTag === null) {
      return;
    }

    getEdgeInsetsForView(viewTag, (insets) => {
      setBottom(insets.bottom!);
    });
  }, []);

  const onEmojiDelPress = useCallback(() => {
    tuiMessageInputRef.current?.deleteTextValue();
  }, []);

  const onEmojiSelect = useCallback((text: string) => {
    tuiMessageInputRef.current?.addTextValue(text);
  }, []);
  const onMessageSendPress = useCallback(() => {
    tuiMessageInputRef.current?.hanldeSubmiting();
  }, []);

  const onMessageSend = ()=>{
    let data = tuiMessageListRef.current?.getItemCount();
    if(data!==undefined && data!>2){
      tuiMessageListRef.current?.scrollToIndex(0);
    }
    
  }

  const mainStyle = {
    transform: [
      {
        translateY: translateY,
      },
    ],
  };

  const messageListContainerStyle = {
    transform: [
      {
        translateY: translateMLY,
      },
    ],
  };

  const viewNode = useRef<View>(null);

  const gesture = Gesture.Tap().onStart(() => {
    console.log("tappppp");
    driver?.hide(driverState);
  });

  const shareDialog = () => {
    return(
      <Overlay
      isVisible={showShareDialog}
      onBackdropPress={()=>{setShowShareDialog(!setShowShareDialog); setShowConfirmDialog(false)}}
      overlayStyle={{backgroundColor:'white',height:ScreenHeight*2/3,width:ScreenWidth*2/3}}
      >
        {MergeMessageReceiver({selectConversationCallback:(conversation:V2TimConversation)=>{
          setSelectedConversation(conversation);
          setShowConfirmDialog(true);
        }})}
      <Dialog
      isVisible={showConfirmDialog}
      onBackdropPress={()=>{setShowConfirmDialog(!setShowConfirmDialog);}}
      overlayStyle={{backgroundColor:'white'}}
    >
      <Dialog.Title title="Dialog Title"/>
      <Text>将消息分享给{selected_conversation!.showName? selected_conversation!.showName:selected_conversation!.conversationID}</Text>
      <Dialog.Actions>
        <Dialog.Button title="确定" onPress={() => {
          console.log("confirm",selected_conversation!.type)
          if(selected_conversation!.type == 1){
            console.log("userID",selected_conversation!.userID)
            sendMergeMessage(selectedList,selected_conversation!.userID!,'')
          }else {
            console.log("groupID",selected_conversation!.groupID)
            sendMergeMessage(selectedList,'',selected_conversation!.groupID!)
          }
          setShowConfirmDialog(false);
          setShowShareDialog(false);
          setSelectMode(false);
          // console.log("selectedList",selectedList);
  
        }}/>
        <Dialog.Button title="取消" onPress={() => {
          setShowShareDialog(false);
          setShowConfirmDialog(false);
        }}/>
      </Dialog.Actions>
    </Dialog>
      </Overlay>

    );
  }

  const multiSelectMode = () => {
    setSelectedList([]);
    console.log("multiSelectmode here");
    setSelectMode(true);
  }

  const multiSelectBar = () => {
    return (
      <View style={styles.multiSelecBar}>
        <View >
          <Pressable onPress={()=>{
            // console.log("delete")
            deleteMultiMessage(selectedList);
            setSelectMode(false);  
          }}>
            <Image style={styles.icon} source={require('../../../assets/delete_message.png')}/>
          </Pressable>
        </View>
        <View>
          <Text>{selectedList.length} selected</Text>
        </View>
        <View>
          <Pressable onPress={()=>{
            console.log("merge")
            setShowShareDialog(true);

          }}>
            <Image style={styles.icon} source={require('../../../assets/share.png')}/>
          </Pressable>
        </View>
      </View>
    );
  }
  const messageSelctedCallback=(msgID:string,isAdd:boolean)=>{
    // console.log(`msgID ${msgID} isAdd ${isAdd}`);
    if(isAdd){
      setSelectedList((prev)=>{
        return [...prev,msgID]
      })
    } else {
      
      setSelectedList((prev)=>{
        let list = prev;
        list.splice(list.indexOf(msgID),1)
        return [...prev]
      })
    }
    console.log(selectedList);
  }
  const {dispatch} = useTUIChatContext();
  const deleteMultiMessage = async (msgIDs:string[]) => {
    const res = await TencentImSDKPlugin.v2TIMManager.getMessageManager().deleteMessages(msgIDs);
    if(res.code == 0){
      msgIDs.forEach((msgID)=>{
        dispatch(
          deleteMessage({
            msgID,
          })
        );
      })
      
    }
  }

  const sendMergeMessage = async (msgIDs:string[],receiver:string,groupID:string) => {
    const res = await TencentImSDKPlugin.v2TIMManager.getMessageManager().createMergerMessage(msgIDs,"mergeMessage",["mergeMessage"],"mergemessage");
    console.log("-----mergerMessage",res.code)
    if(res.code == 0){
      const res2 = await TencentImSDKPlugin.v2TIMManager.getMessageManager().sendMessage({id:res.data?.id!,receiver:receiver,groupID:groupID});
      console.log("send success",res2.code);
    }
  }

  return (
    <SafeAreaProvider>
    <Fragment>
      {
        isSelectMode && <View style={styles.cancelBar}>
        <Pressable onPress={()=>{setSelectMode(false)}}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
      }
       {shareDialog()}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.fill,
            messageListContainerStyle,
            { backgroundColor: "white" },
          ]}
          ref={viewNode}
          onLayout={() => {
            viewNode.current?.measure((x, y, width, height) => {
              keyboard.onFillMessageLayout(height);
              emoji.onFillMessageLayout(height);
              toolbox.onFillMessageLayout(height);
            });
          }}
        >
          <TUIMessageList
            ref={tuiMessageListRef}
            MessageElement={messageItemOption?.ItemComponent ?? MessageElement}
            onLoadMore={onLoadMore}
            unmount={unMount}
            onLayout={(event) => {
              emoji.onMessageListLayout(event);
              toolbox.onMessageListLayout(event);
              keyboard.onMessageListLayout(event);
            }}
            onScroll={() => {
              if (driver?.name === "emoji") {
                emoji.shown && emoji.hide(driverState);
              } else {
                toolbox.shown && toolbox.hide(driverState);
              }
            }}
            multiSelectCallback={multiSelectMode}
            isSelectMode={isSelectMode}
            messageSelctedCallback={messageSelctedCallback}
          />
        </Animated.View>
      </GestureDetector>
      {isSelectMode && multiSelectBar()}
      {!isSelectMode && <KeyboardInsetsView
        style={[mainStyle]}
        onKeyboard={keyboard.createCallback(driverState)}
        onLayout={onLayout}
      >
        <TUIMessageInput
          ref={tuiMessageInputRef}
          loginUserID={loginUserID}
          showFace={textInputOption?.showFace}
          showSound={textInputOption?.showSound}
          showToolBox={textInputOption?.showToolBox}
          convID={convID ?? ""}
          convType={type ?? 1}
          onEmojiTap={() => {
            emoji.toggle(driverState);
          }}
          driverName={driver?.name}
          onToolBoxTap={() => {
            toolbox.toggle(driverState);
          }}
          hideAllPanel={() => {
            if (driver?.name === "emoji") {
              emoji.hide(driverState);
            } else {
              toolbox.hide(driverState);
            }
          }}
          onMessageSend={onMessageSend}
        />
      </KeyboardInsetsView>}
      <TUIMessageToolBox
        loginUserID={loginUserID}
        convID={convID ?? ""}
        convType={type ?? 1}
        onLayout={toolbox.onLayout}
        style={{
          opacity: driver?.name === "toolbox" ? 1 : 0,
          ...toolbox.style
        }}
      />
      <TUIMessageEmoji
        onEmojiDelPress={onEmojiDelPress}
        onEmojiSelect={onEmojiSelect}
        onMessageSendPress={onMessageSendPress}
        onLayout={emoji.onLayout}
        style={{
          opacity: driver?.name === "emoji" ? 1 : 0,
          ...emoji.style
        }}
      />
     
    </Fragment>

    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: ScreenWidth,
    height: ScreenHeight,
    backgroundColor: "#EDEDED",
  },
  fill: {
    flex: 1,
  },
  multiSelecBar:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    height:60,
    backgroundColor:'#ececec',
    paddingHorizontal:10,
    paddingVertical:5
  },
  icon:{
    width:25,
    height:25,
  },
  cancelBar:{
    display:'flex',
    justifyContent:'flex-start',
    backgroundColor:'#ececec',
    paddingHorizontal:10,
    paddingVertical:5
  },
  cancelText:{
    fontSize:16,
    color:'blue'
  }
});

