import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { ConversationList } from '@tencentcloud/chat-uikit-react-native';
import { IRouterParams } from '../../../interface';

export const ConversationListScreen = ({ navigation }: IRouterParams) => {
  const onPressConversation = () => {
    navigation.navigate('Chat');
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent />
      <ConversationList onPressConversation={onPressConversation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
});
