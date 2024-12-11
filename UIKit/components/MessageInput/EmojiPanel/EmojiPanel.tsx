import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Tab, TabView } from '@rneui/themed';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { useChatContext } from '../../../context';

import {
  TAB_ICON_LIST,
  EMOJI_GROUP_LIST,
  EMOJI_TYPE,
  BASIC_EMOJI_URL_MAPPING,
} from '../../../emojiConfig';
import { isIOS } from '../../../utils';

interface IEmojiPanelProps {
  onSelectEmoji: (emojiKey: string) => void;
  onDeleteEmoji: () => void;
  onSubmitEditing: () => void;
}

export const EmojiPanel = (props: IEmojiPanelProps) => {
  const {
    onDeleteEmoji,
    onSubmitEditing,
  } = props;
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.emojiPanelContainer}>
      <Tab
        value={index}
        onChange={(dx: number) => setIndex(dx)}
        indicatorStyle={styles.tabIndicatorStyle}
        style={styles.tabContainer}
      >
        {TAB_ICON_LIST.map((url: string, _index: number) => (
          <Tab.Item
            icon={<Image source={{ uri: url }} style={styles.tabIcon} />}
            containerStyle={[
              styles.tabIem,
              isIOS && styles.tabItemIOS,
              (index === _index) && styles.activeTabIem,
            ]}
            key={_index}
          />
        ))}
      </Tab>
      <TabView
        value={index}
        onChange={setIndex}
        animationType="spring"
        containerStyle={styles.tabViewContainer}
      >
        {EMOJI_GROUP_LIST.map((group: Record<string, any>, groupIndex: number) => (
          <ScrollView
            key={groupIndex}
            showsVerticalScrollIndicator={false}
          >
            {TabViewItem(group, props)}
          </ScrollView>
        ))}
      </TabView>
      {index === 0 && (
        <View style={styles.emojiQuickHandleContainer}>
          <TouchableOpacity
            delayPressIn={0}
            style={styles.deleteEmoji}
            onPress={() => { onDeleteEmoji(); }}
          >
            <Image
              source={require('../../../assets/emoji-delete.png')}
              style={styles.deleteEmojiIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            delayPressIn={0}
            onPress={() => { onSubmitEditing(); }}
          >
            <Text style={styles.sendEmoji}>{TUITranslateService.t('Chat.SEND')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const TabViewItem = (group: Record<string, any>, props: IEmojiPanelProps) => {
  const { onSelectEmoji } = props;
  const { emojiGroupID, list } = group;
  const { sendFaceMessage } = useChatContext();

  const selectEmoji = (emojiIndex: number) => {
    if (group.type === EMOJI_TYPE.BASIC) {
      onSelectEmoji(list[emojiIndex]);
      return;
    }
    sendFaceMessage(emojiGroupID, list[emojiIndex]);
  };
  const computeImageUri = (emojiKey: string) => {
    return group.type === EMOJI_TYPE.BASIC ? `${group.url}${BASIC_EMOJI_URL_MAPPING[emojiKey]}` : `${group.url}${emojiKey}@2x.png`;
  };
  const computeImageStyle = () => {
    if (group.type === EMOJI_TYPE.BASIC) {
      return styles.basicEmoji;
    }
    if (isIOS) {
      return StyleSheet.flatten([styles.bigEmoji, styles.bigEmojiIOS]);
    }
    return styles.bigEmoji;
  };
  return (
    <TabView.Item
      style={styles.tabViewItem}
    >
      <Text>
        {group.list.map((emojiKey: string, emojiIndex: number) => (
          <TouchableOpacity
            delayPressIn={0}
            key={emojiIndex}
            onPress={() => { selectEmoji(emojiIndex); }}
          >
            <Image
              source={{ uri: computeImageUri(emojiKey) }}
              style={computeImageStyle()}
            />
          </TouchableOpacity>
        ))}
      </Text>
    </TabView.Item>
  );
};

const styles = StyleSheet.create({
  emojiPanelContainer: {
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    maxWidth: 126,
    height: 28,
    marginTop: 6,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  tabIndicatorStyle: {
    height: 0,
  },
  tabIem: {
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabItemIOS: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  activeTabIem: {
    backgroundColor: '#EDEDED',
  },
  tabViewContainer: {
    width: '100%',
  },
  tabViewItem: {
    paddingHorizontal: 16,
    height: 240,
  },
  basicEmoji: {
    width: 32,
    height: 32,
  },
  bigEmoji: {
    width: 45,
    height: 45,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  bigEmojiIOS: {
    marginHorizontal: 6,
  },
  emojiQuickHandleContainer: {
    position: 'absolute',
    right: 28,
    bottom: 10,
    flexDirection: 'row',
    flex: 1,
    opacity: 0.6,
  },
  deleteEmoji: {
    width: 45,
    height: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  deleteEmojiIcon: {
    width: 30,
    height: 20,
  },
  sendEmoji: {
    width: 45,
    height: 30,
    textAlign: 'center',
    lineHeight: 28,
    color: '#FFFFFF',
    backgroundColor: '#147AFF',
    borderRadius: 5,
  },
});
