import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Profile } from '@tencentcloud/chat';

import { Avatar } from '../../Avatar';
export interface IUserSelectedViewProps {
  selectedViewStyle?: ViewStyle;
  selectedUserList: Profile[];
  setSelectedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export function UserSelectedView(props: IUserSelectedViewProps) {
  const { selectedViewStyle, selectedUserList, setSelectedUserList } = props;

  const deleteUserSelected = (userID: string) => {
    const updatedList = selectedUserList.map((item) => {
      if (item.userID === userID) {
        return { ...item, checked: false };
      }
      return item;
    }).filter(item => item.userID !== userID);
    setSelectedUserList(updatedList);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      style={styles.selectViewInfo}
      onPress={() => deleteUserSelected(item.userID)}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={item.avatar} />
        <View style={styles.deletedSelectUser}>
          <Image
            source={require('../../../assets/close.png')}
            style={styles.closeSelectIcon}
          />
        </View>
      </View>
      <Text
        style={styles.nick}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.nick || item.userID}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, selectedViewStyle]}>
      <FlatList
        data={selectedUserList}
        renderItem={renderItem}
        keyExtractor={item => item.userID}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    flexDirection: 'row',
  },
  selectViewInfo: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingRight: 18,
    position: 'relative',
  },
  deletedSelectUser: {
    zIndex: 2,
    position: 'absolute',
    right: -2,
    top: 3,
  },
  avatarContainer: {
    position: 'relative',
  },

  closeSelectIcon: {
    width: 12,
    height: 12,
  },
  nick: {
    fontSize: 12,
    maxWidth: 48,
    overflow: 'hidden',
    lineHeight: 17,
    color: '#000',
  },
});
