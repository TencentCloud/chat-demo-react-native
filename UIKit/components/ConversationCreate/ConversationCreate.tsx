import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import TUIChatEngine, {
  TUIConversationService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { Profile } from '@tencentcloud/chat';

import { Overlay } from '../Overlay';
import { Loading } from '../Loading';
import { UserSearch } from '../UserSearch';
import { GroupType } from './GroupTypeIntroduction';
import { CreateNewChat } from './CreateNewChat';
import { CreateGroupOption } from './CreateGroupOption';
import { useConversationListContext } from '../../context/ConversationListContext';

export enum CreateGroupProcess {
  SetParticipants,
  SetGroupOption,
  SetGroupType,
}

export interface ICreateGroupOptions {
  name: string;
  groupID: string;
  type: GroupType;
  avatar: string;
  memberList: Record<string, string>[];
}

export function ConversationCreate() {
  const [userList, setUserList] = useState<Profile[]>([]);
  const [searchedUserList, setSearchedUserList] = useState<Profile[]>([]);
  const [isUserSearched, setUserSearched] = useState<boolean>(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const [createGroupProcess, setCreateGroupProcess] = useState<CreateGroupProcess>(CreateGroupProcess.SetParticipants);
  const [selectedUserList, setSelectedUserList] = useState<Profile[]>([]);
  const [isCreateGroupLoading, setIsCreateGroupLoading] = useState<boolean>(false);
  const [createGroupOptions, setCreateGroupOptions] = useState<ICreateGroupOptions>({
    name: '',
    groupID: '',
    type: TUIChatEngine.TYPES.GRP_WORK,
    avatar: '',
    memberList: [],
  });
  const {
    friendList,
    isConversationCreateShow,
    setConversationCreateShow,
    onPressConversation,
    createGroup,
  } = useConversationListContext();

  useEffect(() => {
    if (isUserSearched) {
      setUserList([...searchedUserList]);
    } else {
      setUserList(friendList.map(item => item.profile));
    }
  }, [isUserSearched, searchedUserList, friendList]);

  const closeCreateGroupOverlay = () => {
    quitAndInitCreateGroup();
  };

  const actionCancel = () => {
    switch (createGroupProcess) {
      case CreateGroupProcess.SetParticipants:
        quitAndInitCreateGroup();
        return;
      case CreateGroupProcess.SetGroupOption:
        setCreateGroupProcess(CreateGroupProcess.SetParticipants);
        return;
      case CreateGroupProcess.SetGroupType:
        setCreateGroupProcess(CreateGroupProcess.SetGroupOption);
        return;
      default:
        return '';
    }
  };

  const nextCreateGroupPage = () => {
    if (selectedUserList && selectedUserList.length === 0) {
      return;
    }
    setCreateGroupProcess(CreateGroupProcess.SetGroupOption);
  };

  const createGroupConversation = () => {
    if (createGroupOptions.name.length === 0) {
      Alert.alert('Please enter the Group name');
      return;
    }
    setIsCreateGroupLoading(true);
    createGroup(createGroupOptions).then((conversationID) => {
      setIsCreateGroupLoading(false);
      switchConversation(conversationID);
      quitAndInitCreateGroup();
    });
  };

  const switchConversation = (conversationID: string) => {
    if (!conversationID) {
      return;
    }
    TUIConversationService.switchConversation(conversationID);
    onPressConversation && onPressConversation();
  };

  const quitAndInitCreateGroup = () => {
    setConversationCreateShow(false);
    setIsCreateGroup(false);
    setCreateGroupProcess(CreateGroupProcess.SetParticipants);
    setSelectedUserList([]);
    setSearchedUserList([]);
    setUserSearched(false);
  };

  const getConversationCreateTitle = () => {
    if (!isCreateGroup) {
      return TUITranslateService.t('Conversation.NEW_CHAT');
    }
    switch (createGroupProcess) {
      case CreateGroupProcess.SetParticipants:
        return TUITranslateService.t('Conversation.SELECT_MEMBER');
      case CreateGroupProcess.SetGroupOption:
        return TUITranslateService.t('Conversation.NEW_GROUP');
      case CreateGroupProcess.SetGroupType:
        return TUITranslateService.t('Conversation.GROUP_TYPE');
      default:
        return '';
    }
  };

  return (
    <Overlay
      isVisible={isConversationCreateShow}
      onClose={closeCreateGroupOverlay}
    >
      <TouchableOpacity
        style={styles.createContainer}
        delayPressIn={0}
        activeOpacity={1}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{getConversationCreateTitle()}</Text>
          <View style={[styles.actionContainer]}>
            <TouchableOpacity
              delayPressIn={0}
              activeOpacity={0.5}
              style={[styles.triggerContainer]}
              onPress={actionCancel}
            >
              <Text style={styles.actionText}>
                {TUITranslateService.t('Common.CANCEL')}
              </Text>
            </TouchableOpacity>
            {isCreateGroup
            && createGroupProcess === CreateGroupProcess.SetParticipants && (
              <TouchableOpacity
                delayPressIn={0}
                activeOpacity={0.5}
                style={[styles.triggerContainer]}
                onPress={nextCreateGroupPage}
              >
                <Text
                  style={[
                    selectedUserList.length > 0
                      ? styles.actionText
                      : styles.disabledCreate,
                  ]}
                >
                  {TUITranslateService.t('Conversation.NEXT')}
                </Text>
              </TouchableOpacity>
            )}
            {isCreateGroup
            && createGroupProcess === CreateGroupProcess.SetGroupOption && (
              <TouchableOpacity
                delayPressIn={0}
                activeOpacity={0.5}
                style={[styles.triggerContainer]}
                onPress={createGroupConversation}
              >
                <Text
                  style={[
                    createGroupOptions.name.length > 0
                      ? styles.actionText
                      : styles.disabledCreate,
                  ]}
                >
                  {TUITranslateService.t('Conversation.CREATE')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {createGroupProcess === CreateGroupProcess.SetParticipants && (
          <UserSearch
            searchStyle={styles.searchContainer}
            friendList={userList}
            isUserSearched={isUserSearched}
            setUserSearched={setUserSearched}
            searchedUserList={searchedUserList}
            setSearchedUserList={setSearchedUserList}
          />
        )}
        {createGroupProcess === CreateGroupProcess.SetParticipants && (
          <CreateNewChat
            userList={userList}
            isCreateGroup={isCreateGroup}
            setIsCreateGroup={setIsCreateGroup}
            selectedUserList={selectedUserList}
            setUserSearched={setUserSearched}
            setSelectedUserList={setSelectedUserList}
            createC2CConversation={switchConversation}
          />
        )}
        {createGroupProcess !== CreateGroupProcess.SetParticipants && (
          <CreateGroupOption
            selectedUserList={selectedUserList}
            setSelectedUserList={setSelectedUserList}
            createGroupProcess={createGroupProcess}
            setCreateGroupProcess={setCreateGroupProcess}
            createGroupOptions={createGroupOptions}
            setCreateGroupOptions={setCreateGroupOptions}
          />
        )}
      </TouchableOpacity>
      {isCreateGroupLoading && <Loading />}
    </Overlay>
  );
}

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    width: '100%',
    paddingLeft: 16,
    paddingTop: 15,
    paddingRight: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PingFang HK',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 40,
    color: '#000000',
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#0365F9',
  },
  disabledCreate: {
    fontSize: 16,
    color: '#00000066',
  },
  triggerContainer: {
    padding: 2,
    lineHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginVertical: 15,
  },
});
