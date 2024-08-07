import { Card, ScreenWidth } from "@rneui/base";
import { Image, Text } from "@rneui/themed";
import React, { Fragment, PropsWithChildren, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  LayoutRectangle,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Keyboard } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector,GestureHandlerRootView } from "react-native-gesture-handler";

import {
  MessageElemType,
  TencentImSDKPlugin,
  V2TimMessage,
} from "react-native-tim-js";
import {
  deleteMessage,
  setRepliedMessage,
  useTUIChatContext,
} from "../../../store";
import { MessageUtils } from "../../../utils/message";
import Clipboard from "@react-native-clipboard/clipboard";
import { useMessageReceipt } from "../../../store/TUIChat/selector";

export const MessageToolTip = <
  T extends {
    message: V2TimMessage;
    keyboardHeight?: number;
    multiSelectCallback?:()=>void;
    startSelect?:()=>void;
  }
>(
  props: PropsWithChildren<T>
) => {
  const [open, setOpen] = React.useState(false);
  const [positionY, setPositionY] = React.useState(0);
  const [componentPosition, setComponentPosition] = useState<LayoutRectangle>();
  const viewRef = React.useRef<View>(null);
  const { dispatch } = useTUIChatContext();
  const {messageReadReceipt} = useMessageReceipt();
  const getPopOverContent = () => {
    console.log("get overlay content");
    const { timestamp, elemType, status, isSelf } = props.message;
    const isCanRevoke =
      MessageUtils.isMessageRevokable(timestamp ?? 0, 120) &&
      status === 2 &&
      isSelf;
    const haveReceipt = props.message.groupID != "null" && props.message.groupID != '' && props.message.isSelf;
    const readCount = messageReadReceipt?.has(props.message.msgID!)? messageReadReceipt?.get(props.message.msgID!)?.readCount : 0;
    const isCanCopy = elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT;
    const tooltipActionList = [
      {
        name: "复制",
        id: "copy_message",
        icon: require("../../../../assets/copy_message.png"),
        show: isCanCopy,
      },
      {
        name: "删除",
        id: "delete_message",
        icon: require("../../../../assets/delete_message.png"),
        show: true,
      },
      {
        name: "撤回",
        id: "revoke_message",
        icon: require("../../../../assets/revoke_message.png"),
        show: isCanRevoke,
      },
      {
        name: "引用",
        id: "reply_message",
        icon: require("../../../../assets/reply_message.png"),
        show: true,
      },
      {
        name: "多选",
        id: "select_multiple",
        icon: require("../../../../assets/selection.png"),
        show: true,
      },
      {
        name: `${readCount}名成员已读`,
        id: "has_read",
        icon: require("../../../../assets/group_read_count.png"),
        show: haveReceipt,
      },
    ];
    return (
      <View style={styles.actionContainer}>
          <FlatList
          style={{width:'100%',margin:'auto'}}
          data={tooltipActionList}
          renderItem={( {item} ) => {
            if(item.show){
              return (
                <Pressable
                key={item.id}
                onPress={() => {
                  hanldeTooltipTaped(item.id);
                }}
                style={styles.actionItemContainer}
                >
                    <Image source={item.icon} style={styles.actionIcon} />
                    <Text style={{ fontSize: 10 }}>{item.name}</Text>
                </Pressable>
              );
            }
            return <View></View>
          }}
        />   
      </View>
    );
  };

  const hanldeTooltipTaped = async (type: string) => {
    if (type === "copy_message") {
      const { textElem } = props.message;
      Clipboard.setString(textElem?.text ?? "");
    } else if (type === "delete_message") {
      const { msgID } = props.message;
      if (msgID) {
        const { code } = await TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .deleteMessages([msgID!]);
        if (code === 0) {
          dispatch(
            deleteMessage({
              msgID,
            })
          );
        }
      }
    } else if (type === "revoke_message") {
      const { message } = props;
      const { msgID } = message;
      if (msgID) {
        TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .revokeMessage(msgID!);
      }
    } else if (type === "reply_message") {
      const { message } = props;
      dispatch(
        setRepliedMessage({
          message,
        })
      );
    } else if(type == "select_multiple"){
      if(props.multiSelectCallback){
        props.multiSelectCallback();
      }
      if(props.startSelect){
        props.startSelect();
      }
    }
    setOpen(false);
  };

  const gesture = Gesture.LongPress().onStart((event) => {
    const { absoluteY, y } = event;
    const halfHeight = componentPosition!.height;
    if (Keyboard.isVisible()) {
      Keyboard.dismiss()

      setTimeout(() => {
        // console.log(`absoluteheight ${absoluteY} props.keyboardHeight:${props.keyboardHeight} last height ${absoluteY - y + halfHeight + (props.keyboardHeight ?? 0) - 25}`);
        let position = absoluteY - y + halfHeight + 270;
        if(position > 650){
          position = position - 100
        }
        setPositionY(
          absoluteY - y + halfHeight +270
        );
        setOpen(true);
      }, 100);
    } else {
      // console.log(`${absoluteY},${y},${halfHeight}`);
      // console.log("setpositionY", absoluteY - y + halfHeight);
      if(absoluteY<650){
        setPositionY(absoluteY - y + halfHeight);
      }else{
        // console.log("setpositionYYY", absoluteY  - y);
        setPositionY(absoluteY - y - 120);
      }
      
      setOpen(true);
    }
  });

  const closeTooltip = Gesture.Tap().onStart(() => {
    setOpen(false);
  });

  const calculatePosition = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const height = event.nativeEvent.layout.height;
    if (!componentPosition && viewRef.current) {
      viewRef.current.measureInWindow((x, y) => {
        setComponentPosition({
          x,
          y,
          width,
          height,
        });
      });
    }
  };

  const getMarginLeft = () => {
    const isSelf = props.message.isSelf ?? false;
    return !isSelf ? 12 : ScreenWidth - 200  ;
  };

  const compose = Gesture.Exclusive(closeTooltip, gesture);

  return (
    <Fragment>
      <GestureHandlerRootView>
        <GestureDetector gesture={compose}>
          <View
            ref={viewRef}
            onLayout={calculatePosition}
          >
            {props.children}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      {open && (
        <Modal
          visible={open}
          onRequestClose={() => setOpen(false)}
          animationType="fade"
          transparent
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setOpen(false);
            }}
          >
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: "transparent",
              }}
            >
              <View
                style={{
                  marginLeft: getMarginLeft(),
                  marginTop: positionY,
                }}
              >
                {getPopOverContent()}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    display: "flex",
    alignContent:"flex-start",
    width: 100,
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#ccc",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.8,
    marginTop:-20,
    marginHorizontal:0,
    paddingHorizontal:0,
    borderRadius: 8,
  },
  actionItemContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor:'white',
    marginHorizontal:5,
    marginVertical: 5,
  },
  actionIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
});
