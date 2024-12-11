import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Profile } from '@tencentcloud/chat';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../../Avatar';
import { CreateGroupChat } from './CreateGroupChat';
import { useConversationListContext } from '../../../context/ConversationListContext';

export interface ICreateNewChatProps {
  userList: Profile[];
  isCreateGroup: boolean;
  setIsCreateGroup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUserList: Profile[];
  setSelectedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
  setUserSearched: React.Dispatch<React.SetStateAction<boolean>>;
  createC2CConversation: (conversationID: string) => void;
}

export function CreateNewChat(props: ICreateNewChatProps) {
  const {
    userList,
    isCreateGroup,
    selectedUserList,
    setSelectedUserList,
    setIsCreateGroup,
    createC2CConversation,
    setUserSearched,
  } = props;
  const { setConversationCreateShow } = useConversationListContext();

  const onCreateGroup = () => {
    setIsCreateGroup(true);
    setUserSearched(false);
    setSelectedUserList([]);
  };

  const _createC2CConversation = (profile: Profile) => {
    const conversationID = `C2C${profile.userID}`;
    createC2CConversation(conversationID);
    setConversationCreateShow(false);
  };
  const renderItem = ({ item }) => {
    const { userID, nick, avatar } = item;
    return (
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={0.5}
        key={userID}
        style={styles.itemContainer}
        onPress={() => _createC2CConversation(item)}
      >
        <View style={styles.itemLeft}>
          <Avatar uri={avatar} />
          <Text
            style={styles.itemName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {nick || userID}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  if (isCreateGroup) {
    return (
      <CreateGroupChat
        userList={userList}
        selectedUserList={selectedUserList}
        setSelectedUserList={setSelectedUserList}
      />
    );
  }
  return (
    <View style={styles.userListContainer}>
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={styles.createContainer}
        onPress={onCreateGroup}
      >
        <Image
          source={require('../../../assets/add.png')}
          style={[styles.iconAddSize]}
        />
        <Text style={styles.createTitle}>
          {TUITranslateService.t('Conversation.NEW_GROUP')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.contactedTitle}>
        {TUITranslateService.t('Conversation.FREQUENTLY_CONTACTED')}
      </Text>
      {userList.length === 0
        ? (
            <Text style={styles.noUserText}>
              {TUITranslateService.t('Conversation.NO_RESULT')}
            </Text>
          )
        : (
            <FlatList
              data={userList}
              renderItem={renderItem}
              keyExtractor={item => item.userID}
              showsVerticalScrollIndicator={false}
            />
          )}
    </View>
  );
}

const styles = StyleSheet.create({
  userListContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'PingFang SC',
    width: '70%',
    marginLeft: 10,
    color: '#000000',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  createContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  createTitle: {
    fontSize: 14,
    padding: 10,
    fontWeight: '600',
    color: '#0365F9',
  },
  contactedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    paddingBottom: 18,
  },
  iconAddSize: {
    height: 24,
    width: 24,
  },
  noUserText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    fontFamily: 'PingFang SC',
    color: '#999999',
  },
});
