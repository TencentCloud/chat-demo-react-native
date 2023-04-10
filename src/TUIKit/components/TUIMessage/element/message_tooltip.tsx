import {ScreenWidth} from '@rneui/base';
import {Image, Text} from '@rneui/themed';
import React, {Fragment, useState} from 'react';
import {LayoutChangeEvent, LayoutRectangle, Modal} from 'react-native';
import {Keyboard} from 'react-native';
import {Pressable, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {
  MessageElemType,
  TencentImSDKPlugin,
  V2TimMessage,
} from 'react-native-tim-js';
import {
  deleteMessage,
  setRepliedMessage,
  useTUIChatContext,
} from '../../../store';
import {MessageUtils} from '../../../utils/message';
import Clipboard from '@react-native-clipboard/clipboard';

export const MessageToolTip: React.FC<{
  message: V2TimMessage;
  keyboardHeight?: number;
}> = props => {
  const [open, setOpen] = React.useState(false);
  const [positionY, setPositionY] = React.useState(0);
  const [componentPosition, setComponentPosition] = useState<LayoutRectangle>();
  const viewRef = React.useRef<View | null>();
  const {dispatch} = useTUIChatContext();

  const getPopOverContent = () => {
    console.log('get overlay content');
    const {timestamp, elemType, status} = props.message;
    const isCanRevoke =
      MessageUtils.isMessageRevokable(timestamp ?? 0, 120) && status === 2;
    const isCanCopy = elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT;
    const tooltipActionList = [
      {
        name: '复制',
        id: 'copy_message',
        icon: require('../../../../assets/copy_message.png'),
        show: isCanCopy,
      },
      {
        name: '删除',
        id: 'delete_message',
        icon: require('../../../../assets/delete_message.png'),
        show: true,
      },
      {
        name: '撤回',
        id: 'revoke_message',
        icon: require('../../../../assets/revoke_message.png'),
        show: isCanRevoke,
      },
      {
        name: '引用',
        id: 'reply_message',
        icon: require('../../../../assets/reply_message.png'),
        show: true,
      },
    ];
    return (
      <View style={styles.actionContainer}>
        {tooltipActionList
          .filter(item => item.show)
          .map(item => (
            <Pressable
              key={item.id}
              onPress={() => {
                hanldeTooltipTaped(item.id);
              }}>
              <View style={styles.actionItemContainer}>
                <Image source={item.icon} style={styles.actionIcon} />
                <Text style={{fontSize: 10}}>{item.name}</Text>
              </View>
            </Pressable>
          ))}
      </View>
    );
  };

  const hanldeTooltipTaped = async (type: string) => {
    if (type === 'copy_message') {
      const {textElem} = props.message;
      Clipboard.setString(textElem?.text ?? '');
    } else if (type === 'delete_message') {
      const {msgID} = props.message;
      if (msgID) {
        const {code} = await TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .deleteMessages([msgID!]);
        if (code === 0) {
          dispatch(
            deleteMessage({
              msgID,
            }),
          );
        }
      }
    } else if (type === 'revoke_message') {
      const {message} = props;
      const {msgID} = message;
      if (msgID) {
        TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .revokeMessage(msgID!);
      }
    } else if (type === 'reply_message') {
      const {message} = props;
      dispatch(
        setRepliedMessage({
          message,
        }),
      );
    }
    setOpen(false);
  };

  const gesture = Gesture.LongPress().onStart(event => {
    const {absoluteY, y} = event;
    const halfHeight = componentPosition!.height;
    if (Keyboard.isVisible()) {
      setTimeout(() => {
        setPositionY(
          absoluteY - y + halfHeight + (props.keyboardHeight ?? 0) - 25,
        );
        setOpen(true);
      }, 200);
    } else {
      setPositionY(absoluteY - y + halfHeight);
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
    return !isSelf ? 12 : ScreenWidth - 192;
  };

  return (
    <Fragment>
      <GestureDetector gesture={gesture}>
        <View ref={ref => (viewRef.current = ref)} onLayout={calculatePosition}>
          {props.children}
        </View>
      </GestureDetector>

      {open && (
        <Modal
          visible={open}
          transparent
          onRequestClose={() => setOpen(false)}
          animationType="fade">
          <GestureDetector gesture={closeTooltip}>
            <View
              style={{
                flex: 1,
                margin: 0,
                backgroundColor: 'transparent',
              }}>
              <View
                style={{
                  // width: 200,
                  // height: 200,
                  marginLeft: getMarginLeft(),
                  marginTop: positionY,
                }}>
                {getPopOverContent()}
              </View>
            </View>
          </GestureDetector>
        </Modal>
      )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    shadowColor: '#ccc',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.8,
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 180,
    backgroundColor: 'white',
    // justifyContent: '',
    alignItems: 'flex-start',
    shadowColor: '#ccc',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.8,
    paddingTop: 10,
    borderRadius: 8,
  },
  actionItemContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginLeft: 20,
    marginBottom: 10,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
});
