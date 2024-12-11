import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Profile } from '@tencentcloud/chat';

import { Avatar } from '../../Avatar';
import { Checkbox } from './Checkbox';

export interface IUserSelectItemProps {
  item: Record<string, any>;
  onChange: (checked: boolean) => void;
  selectedUserList: Profile[];
}

export function UserSelectItem(props: IUserSelectItemProps) {
  const { item, onChange, selectedUserList } = props;
  const { userID, nick, avatar } = item;
  const [isChecked, setIsChecked] = useState(false);

  const userSelected = (checked: boolean) => {
    setIsChecked(checked);
    if (onChange) {
      onChange(checked);
    }
  };

  const userIsChecked = () => {
    return selectedUserList.some(
      (item: Record<string, any>) => item.userID === userID,
    );
  };

  return (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      key={userID}
      style={styles.itemContainer}
      onPress={() => userSelected(!isChecked)}
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
      <Checkbox
        isChecked={userIsChecked()}
        onChange={(checked: boolean) => userSelected(checked)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
});
