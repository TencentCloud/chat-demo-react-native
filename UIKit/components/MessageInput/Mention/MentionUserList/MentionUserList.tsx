import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
} from 'react-native';

import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../../../Avatar';
import { CheckBox } from '../../../CheckBox';

import { randomInt } from '../../../../utils';

interface IMentionUserListProps {
  dataList: Record<string, any>[];
  onClose: () => void;
  onConfirm?: (checkedList: any[]) => void;
  loadMoreData?: () => void;
}

interface IMentionUserItemProps {
  data: Record<string, any>;
  checked: boolean;
  setChecked: (checked: boolean, data: Record<string, any>) => void;
}

export const MentionUserList = (props: IMentionUserListProps) => {
  const {
    dataList,
    onClose,
    onConfirm,
    loadMoreData,
  } = props;

  const [checkedList, setCheckedList] = useState<any[]>([]);

  const setChecked = (checked: boolean, data: Record<string, any>) => {
    if (checked) {
      setCheckedList([...checkedList, data]);
    } else {
      setCheckedList(checkedList.filter(item => item.userID !== data.userID));
    }
  };

  const _onConfirm = () => {
    if (checkedList.length > 0) {
      onConfirm?.(checkedList);
    }
  };

  const _loadMoreData = () => {
    loadMoreData?.();
  };

  const preventDefault = (event: any) => {
    event.preventDefault();
  };

  return (
    <TouchableWithoutFeedback onPressIn={preventDefault}>
      <View style={styles.userListContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            delayPressIn={0}
            activeOpacity={1}
            onPress={onClose}
          >
            <Image
              style={styles.closeIcon}
              source={require('../../../../assets/close-gray.png')}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={dataList}
          renderItem={({ item, index }) => (
            <MentionUserItem
              key={index}
              data={item}
              checked={checkedList.some(checkedItem => checkedItem.userID === item.userID)}
              setChecked={setChecked}
            />
          )}
          keyExtractor={item => `${item.text}-${randomInt()}`}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => _loadMoreData()}
        />
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          style={[
            styles.confirmContainer,
            checkedList.length > 0 && styles.activeConfirmContainer,
          ]}
          onPress={_onConfirm}
        >
          <Text style={styles.confirmText}>{TUITranslateService.t('Common.CONFIRM')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const MentionUserItem = (props: IMentionUserItemProps) => {
  const { data, checked, setChecked } = props;

  return (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      onPress={() => setChecked(!checked, data)}
    >
      <View style={styles.userItem}>
        <Avatar
          uri={data.avatar}
          size={40}
          radius={20}
          styles={styles.avatar}
        />
        <Text
          style={styles.text}
          numberOfLines={1}
        >
          {data.text}
        </Text>
        <CheckBox checked={checked} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userListContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  closeIcon: {
    marginLeft: 'auto',
    width: 20,
    height: 20,
  },
  userItem: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  avatar: {
    marginRight: 16,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingRight: 60,
  },
  confirmContainer: {
    height: 46,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#147AFF',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeConfirmContainer: {
    opacity: 1,
  },
});
