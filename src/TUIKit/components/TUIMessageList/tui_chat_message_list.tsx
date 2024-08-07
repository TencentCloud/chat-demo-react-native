import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import {LayoutChangeEvent, ListRenderItem, StyleSheet} from 'react-native';
import {Keyboard} from 'react-native';
import {FlatList} from 'react-native';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';
import {useMessageList} from '../../store/TUIChat/selector';

interface TUIMessageListProps {
  MessageElement: React.ComponentType<{message: V2TimMessage,multiSelectCallback?:()=>void,isSelectMode?:boolean,messageSelctedCallback?:(msgID:string,isAdd:boolean)=>void}>;
  onLoadMore: (id: string) => void;
  unmount?: (messageList: V2TimMessage[]) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onScroll: () => void;
  multiSelectCallback?:()=>void;
  isSelectMode:boolean;
  messageSelctedCallback?:(msgID:string,isAdd:boolean)=>void;

}

export interface TUIMessageListRef {
  scrollToIndex: (index: number) => void;
  getItemCount:()=>number;
}

export const TUIMessageList = forwardRef<
TUIMessageListRef,
TUIMessageListProps
>((props: TUIMessageListProps,ref) => {
  const messageRef = useRef<V2TimMessage[]>();
  const messageListRef = useRef<FlatList<V2TimMessage> | null>();
  const {messageList, lastMsgId, messageListWithoutTimestamp} =
    useMessageList();

  useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number) => {
        console.log("scrollToIndex here");
        messageListRef.current?.scrollToIndex({index: index});
      },
      getItemCount:()=>{
        return messageList.length;
      }
    }));

  const renderItem: ListRenderItem<V2TimMessage> = ({item}) => {
    const {MessageElement,multiSelectCallback,isSelectMode,messageSelctedCallback} = props;
    // console.log(` message id ${item.msgID}`)
    return <MessageElement message={item} multiSelectCallback={multiSelectCallback} isSelectMode={isSelectMode} messageSelctedCallback={messageSelctedCallback}/>;
  }

  const getMessageIdentifier = (message: V2TimMessage) => {
    return `${message?.msgID} - ${message?.timestamp} - ${message?.seq} -${message?.id} -${message?.status}`;
  };


  useEffect(() => {
    messageRef.current = messageListWithoutTimestamp.slice(0, 10);
  }, [messageListWithoutTimestamp]);


  useEffect(() => {
    const callback = () => {
      messageListRef.current?.scrollToIndex({
        index: 0,
      });
    };
    const submition = Keyboard.addListener('keyboardWillShow', callback);
    return () => {
      try {
        Keyboard.removeAllListeners('keyboardWillShow');
      } catch(error) {
        console.log(error);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      props.unmount && props.unmount(messageRef.current ?? []);
      
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View onLayout={props.onLayout}>
      <FlatList
        onScroll={props.onScroll}
        ref={(ref) => (messageListRef.current = ref)}
        onLayout={props.onLayout}
        style={styles.flatContainer}
        keyboardDismissMode="on-drag"
        keyExtractor={getMessageIdentifier}
        data={messageList}
        renderItem={renderItem}
        inverted
        onEndReachedThreshold={0.5}
        onEndReached={() => props.onLoadMore(lastMsgId ?? '')}
        maxToRenderPerBatch={20} 
      />
    </View>
  );
});

const styles = StyleSheet.create({
  flatContainer: {
    flexGrow: 0,
  },
});
