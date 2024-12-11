import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Profile } from '@tencentcloud/chat';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../../Avatar';
import { UserSelectedView } from '../../UserSelector';
import { GroupTypeIntroduction, GroupType, typeInfoList } from '../GroupTypeIntroduction';

import {
  GROUP_AVATAR_WORK,
  GROUP_AVATAR_PUBLIC,
  GROUP_AVATAR_MEETING,
  GROUP_AVATAR_AVCHATROOM,
} from '../../../constant';

import { CreateGroupProcess, ICreateGroupOptions } from '../ConversationCreate';
import { useConversationListContext } from '../../../context/ConversationListContext';

export interface ICreateGroupOptionProps {
  createGroupProcess: CreateGroupProcess;
  setCreateGroupProcess: React.Dispatch<React.SetStateAction<CreateGroupProcess>>;
  selectedUserList: Profile[];
  setSelectedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
  createGroupOptions: ICreateGroupOptions;
  setCreateGroupOptions: React.Dispatch<React.SetStateAction<ICreateGroupOptions>>;
}

export const CreateGroupOption = (props: ICreateGroupOptionProps) => {
  const {
    createGroupProcess,
    setCreateGroupProcess,
    selectedUserList,
    setSelectedUserList,
    setCreateGroupOptions,
  } = props;

  const { userProfile } = useConversationListContext();
  const [groupName, setGroupName] = useState<string>('');
  const [groupID, setGroupID] = useState<string>('');
  const [groupType, setGroupType] = useState<GroupType>(GroupType.Work);
  const inputGroupNameRef = useRef<any>();
  const inputGroupIDRef = useRef<any>();

  useEffect(() => {
    setCreateGroupOptions({
      name: groupName,
      groupID,
      type: groupType as any,
      avatar: getDefaultAvatar(groupType),
      memberList: getMemberList(selectedUserList),
    });
  }, [groupName, groupType, groupID, selectedUserList, setCreateGroupOptions]);

  useEffect(() => {
    const getInitialGroupName = (_selectList: Profile[]) => {
      const userNameList = _selectList.map((item: Profile) => item.nick || item.userID);
      const { nick, userID } = userProfile;
      const newUserNameList = [nick || userID].concat(userNameList);
      let userName = newUserNameList.join(', ');
      userName = userName.length > 15 ? `${userName.slice(0, 30)}...` : userName;
      setGroupName(userName);
    };
    getInitialGroupName(selectedUserList);
  }, [selectedUserList, userProfile]);

  const getMemberList = (_selectList: Record<string, any>[]) => {
    const userList = _selectList.map(item => ({
      userID: item.userID,
    }));
    return userList;
  };

  const getDefaultAvatar = (type: GroupType) => {
    switch (type) {
      case GroupType.Work:
        return GROUP_AVATAR_WORK;
      case GroupType.Public:
        return GROUP_AVATAR_PUBLIC;
      case GroupType.Meeting:
        return GROUP_AVATAR_MEETING;
      case GroupType.AVChatRoom:
        return GROUP_AVATAR_AVCHATROOM;
      default:
        return GROUP_AVATAR_WORK;
    }
  };

  const getGroupTypeDescribe = () => typeInfoList?.find((item: any) => item.type === groupType)?.des;

  const onGroupNameChange = (text: string) => {
    setGroupName(text);
  };

  const onGroupIDChange = (text: string) => {
    setGroupID(text);
  };

  const onGroupTypeButtonPress = () => {
    setCreateGroupProcess(CreateGroupProcess.SetGroupType);
  };

  const onBlurInputRef = () => {
    inputGroupNameRef?.current?.blur();
    inputGroupIDRef?.current?.blur();
  };

  if (createGroupProcess === CreateGroupProcess.SetGroupType) {
    return (
      <GroupTypeIntroduction
        groupType={groupType}
        setGroupType={setGroupType}
        setCreateGroupProcess={setCreateGroupProcess}
      />
    );
  }
  return (
    <KeyboardAvoidingView>
      <TextInput
        ref={inputGroupNameRef}
        maxLength={100}
        value={groupName}
        onChangeText={onGroupNameChange}
        placeholder={TUITranslateService.t('Conversation.INPUT_GROUP_NAME')}
        style={styles.inputGroupName}
        placeholderTextColor="#00000066"
      />
      <TextInput
        ref={inputGroupIDRef}
        value={groupID}
        onChangeText={onGroupIDChange}
        placeholder={TUITranslateService.t('Conversation.INPUT_GROUPID')}
        style={styles.inputGroupID}
        placeholderTextColor="#00000066"
      />
      <TouchableWithoutFeedback onPress={onBlurInputRef}>
        <View>
          <TouchableOpacity
            delayPressIn={0}
            activeOpacity={1}
            style={styles.groupTypeContainer}
            onPress={onGroupTypeButtonPress}
          >
            <Text style={styles.groupTypeTitle}>
              {TUITranslateService.t('Conversation.GROUP_TYPE')}
            </Text>
            <View style={styles.groupTypeSelect}>
              <Text style={styles.groupTypeValue}>{groupType}</Text>
              <Image
                source={require('../../../assets/right-arrow.png')}
                style={[styles.iconRightArrow]}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.groupDec}>{getGroupTypeDescribe()}</Text>
          <View>
            <Text style={styles.groupPortraitTitle}>
              {TUITranslateService.t('Conversation.GROUP_AVATAR')}
            </Text>
            <Avatar uri={getDefaultAvatar(groupType)} />
          </View>
          <Text style={styles.portraitTitle}>
            {TUITranslateService.t('Conversation.SELECTED_MEMBER')}
          </Text>
          <View style={styles.portraitInfo}>
            <UserSelectedView
              selectedUserList={selectedUserList}
              setSelectedUserList={setSelectedUserList}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputGroupName: {
    fontWeight: '600',
    fontSize: 14,
    paddingLeft: 0,
    color: '#000000',
    height: 46,
  },
  inputGroupID: {
    fontSize: 16,
    borderBottomColor: '#EEEEEE',
    paddingLeft: 0,
    borderBottomWidth: 0.5,
    height: 46,
    color: '#000000',
  },

  groupTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 0.5,
  },
  groupTypeTitle: {
    fontSize: 16,
    color: '#00000066',
  },
  groupTypeValue: {
    fontSize: 16,
    color: '#000000',
  },
  groupTypeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconRightArrow: {
    marginLeft: 16,
    height: 12,
    width: 7,
  },
  groupDec: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 19,
  },
  portraitTitle: {
    fontWeight: '600',
    fontSize: 14,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#000000',
  },
  groupPortraitTitle: {
    fontWeight: '600',
    fontSize: 14,
    paddingBottom: 20,
    paddingTop: 20,
    color: '#000000',
  },
  portraitInfo: {
    flexDirection: 'row',
  },
});
