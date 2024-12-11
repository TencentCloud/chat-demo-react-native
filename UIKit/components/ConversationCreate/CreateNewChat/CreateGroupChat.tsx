import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Profile } from '@tencentcloud/chat';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { UserSelectList, UserSelectedView } from '../../UserSelector';

export interface ICreateGroupChatProps {
  userList: Profile[];
  selectedUserList: Profile[];
  setSelectedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export function CreateGroupChat(props: ICreateGroupChatProps) {
  const { userList, selectedUserList, setSelectedUserList } = props;

  return (
    <View style={styles.container}>
      {selectedUserList.length > 0 && (
        <UserSelectedView
          selectedViewStyle={styles.userSelectViewContainer}
          selectedUserList={selectedUserList}
          setSelectedUserList={setSelectedUserList}
        />
      )}
      <Text style={styles.contactedTitle}>
        {TUITranslateService.t('Conversation.FREQUENTLY_CONTACTED')}
      </Text>
      <UserSelectList
        userList={userList}
        selectedUserList={selectedUserList}
        setSelectedUserList={setSelectedUserList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSelectViewContainer: {
    marginBottom: 15,
  },
  contactedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    paddingBottom: 18,
  },
});
