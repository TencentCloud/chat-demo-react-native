/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  Animated,
  LayoutChangeEvent,
  ListRenderItem,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { styles } from "./styles";
import { emojiData } from "./emoji_data";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Image } from "@rneui/themed";
import { Pressable } from "react-native";

interface TUIEmojiPanelProps {
  onEmojiSelect: (emoji: string) => void;
  onEmojiDelPress: () => void;
  onMessageSendPress: () => void;
}

interface TUIMessageEmojiProps extends TUIEmojiPanelProps {
  onLayout: (event: LayoutChangeEvent) => void;
  style: Animated.WithAnimatedObject<ViewStyle>;
}

export const TUIMessageEmoji = (props: TUIMessageEmojiProps) => {
  return (
    <Animated.View
      style={[styles.absolute, props.style]}
      onLayout={props.onLayout}
    >
      <EmojiPanel
        onEmojiDelPress={props.onEmojiDelPress}
        onEmojiSelect={props.onEmojiSelect}
        onMessageSendPress={props.onMessageSendPress}
      />
    </Animated.View>
  );
};

const EmojiPanel = React.memo((props: TUIEmojiPanelProps) => {
  const { bottom } = useSafeAreaInsets();
  const { onEmojiDelPress, onEmojiSelect, onMessageSendPress } = props;
  const windowWidth = useWindowDimensions().width;
  const getData = () => {
    const rowCount = Math.floor(windowWidth / 40);
    const result = emojiData.reduce<
      Array<Array<{ name: string; unicode: number }>>
    >((acc, cur, i) => {
      const index = Math.floor(i / rowCount); // 计算当前元素应该放在哪个子数组中
      if (!acc[index]) {
        acc[index] = [];
      }
      acc![index]!.push(cur); // 将当前元素添加到子数组中
      return acc;
    }, []);
    return result;
  };

  const charFromUtf16 = (utf16: any) => {
    return String.fromCodePoint(...utf16.split("-").map((u: any) => "0x" + u));
  };

  const rederItem: ListRenderItem<Array<{ name: string; unicode: number }>> = (
    ceil
  ) => {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {ceil.item.map((item) => {
          const displayText = charFromUtf16(item.unicode.toString(16));
          return (
            <Pressable
              key={item.name}
              onPress={() => {
                onEmojiSelect(displayText);
              }}
            >
              <View style={{ width: 40, height: 40 }}>
                <Text style={{ fontSize: 26, color: 'black'  }}>{displayText}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.emoji,
        {
          paddingBottom: bottom,
        },
      ]}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        data={getData()}
        renderItem={rederItem}
      />
      <View
        style={[
          styles.buttonContainer,
          {
            bottom: bottom,
          },
        ]}
      >
        <Image
          source={require("../../../assets/delete_emoji.png")}
          style={styles.delImg}
          onPress={onEmojiDelPress}
        />
        <Button
          title="发送"
          buttonStyle={styles.sendBtn}
          titleStyle={{ fontSize: 12 }}
          containerStyle={{
            marginLeft: 10,
          }}
          onPress={onMessageSendPress}
        />
      </View>
    </View>
  );
});
