import React from 'react';
import { Text, FlatList, StyleSheet } from 'react-native';
import { Profile } from '@tencentcloud/chat';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { UserSelectItem } from './UserSelectItem';

export interface UserSelectListProps {
  userList: Profile[];
  selectedUserList: Profile[];
  setSelectedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export function UserSelectList(props: UserSelectListProps) {
  const {
    selectedUserList,
    setSelectedUserList,
    userList,
  } = props;

  const userSelectListChange = (e: any, item: any) => {
    const { userID } = item;
    const { checked } = e.target;
    if (checked) {
      selectedUserList.push(item);
    } else {
      selectedUserList.splice(selectedUserList.findIndex(item => item.userID === userID), 1);
    }
    setSelectedUserList([...selectedUserList]);
  };
  if (userList.length === 0) {
    return (
      <Text style={styles.noUserText}>
        {TUITranslateService.t('Conversation.NO_RESULT')}
      </Text>
    );
  }
  return (
    <FlatList
      style={styles.container}
      data={userList}
      renderItem={({ item }) => (
        <UserSelectItem
          selectedUserList={selectedUserList}
          item={item}
          onChange={(checked: boolean) => {
            userSelectListChange({ target: { checked } }, item);
          }}
        />
      )}
      keyExtractor={item => item.userID}
      showsVerticalScrollIndicator={false}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noUserText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    fontFamily: 'PingFang SC',
    color: '#999999',
  },
});
