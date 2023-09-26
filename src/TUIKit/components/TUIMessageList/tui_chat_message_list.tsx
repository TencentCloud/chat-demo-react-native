import React, {useEffect, useRef} from 'react';
import {LayoutChangeEvent, ListRenderItem, StyleSheet} from 'react-native';
import {Keyboard} from 'react-native';
import {FlatList} from 'react-native';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js/lib/typescript/src/interface';
import {useMessageList} from '../../store/TUIChat/selector';

interface TUIMessageListProps {
  MessageElement: React.ComponentType<{message: V2TimMessage}>;
  onLoadMore: (id: string) => void;
  unmount?: (messageList: V2TimMessage[]) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onScroll: () => void;
}

export const TUIMessageList = (props: TUIMessageListProps) => {
  const messageRef = useRef<V2TimMessage[]>();
  const messageListRef = useRef<FlatList<V2TimMessage> | null>();
  const {messageList, lastMsgId, messageListWithoutTimestamp} =
    useMessageList();

  const renderItem: ListRenderItem<V2TimMessage> = ({item}) => {
    const {MessageElement} = props;
    return <MessageElement message={item} />;
  };

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
        Keyboard.removeSubscription(submition);
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
        ref={ref => (messageListRef.current = ref)}
        onLayout={props.onLayout}
        style={styles.flatContainer}
        keyboardDismissMode="on-drag"
        keyExtractor={getMessageIdentifier}
        data={messageList}
        renderItem={renderItem}
        inverted
        onEndReached={() => props.onLoadMore(lastMsgId ?? '')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatContainer: {
    flexGrow: 0,
  },
});
