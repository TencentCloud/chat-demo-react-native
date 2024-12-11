import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { Profile } from '@tencentcloud/chat';
import { TUIUserService, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

export interface IUserSearchProps {
  searchStyle?: ViewStyle;
  friendList?: Profile[];
  isUserSearched: boolean;
  setUserSearched: React.Dispatch<React.SetStateAction<boolean>>;
  searchedUserList: Profile[];
  setSearchedUserList: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export const UserSearch = (props: IUserSearchProps) => {
  const {
    searchStyle,
    friendList,
    setSearchedUserList,
    isUserSearched,
    setUserSearched,
  } = props;
  const [searchText, setSearchText] = useState<string>('');
  const searchInputRef = React.useRef<any>();

  useEffect(() => {
    if (searchText === '') {
      setUserSearched(false);
    }
  }, [searchText, setUserSearched]);

  useEffect(() => {
    if (!isUserSearched) {
      setSearchText('');
      setSearchedUserList([]);
    }
  }, [isUserSearched, setSearchText, setSearchedUserList]);

  const clearSearchResult = () => {
    setSearchText('');
    setUserSearched(false);
  };
  const onSearchResult = async () => {
    setUserSearched(true);
    searchInputRef?.current?.blur();
    if (!searchText) {
      setSearchedUserList([]);
      return;
    }
    const foundFriend = friendList?.find(friend => friend.userID === searchText);
    if (foundFriend) {
      setSearchedUserList([foundFriend]);
      return;
    }
    const { data } = await TUIUserService.getUserProfile({ userIDList: [searchText] });
    setSearchedUserList(data);
  };

  return (
    <View style={[styles.container, searchStyle]}>
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        onPress={onSearchResult}
      >
        <Image
          source={require('../../assets/search-user.png')}
          style={styles.iconSearch}
        />
      </TouchableOpacity>
      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder={TUITranslateService.t('Conversation.SEARCH_USER')}
        onChangeText={text => setSearchText(text)}
        value={searchText}
        returnKeyType="search"
        onSubmitEditing={onSearchResult}
      />
      {searchText && (
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          onPress={clearSearchResult}
          style={styles.clearIconContainer}
        >
          <Image
            source={require('../../assets/clear.png')}
            style={[styles.iconClear]}
          />
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
  },
  iconSearch: {
    width: 18,
    height: 18,
  },
  iconClear: {
    width: 15,
    height: 15,
  },
  clearIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
});

export default UserSearch;
