import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TextStyle,
} from 'react-native';

import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../Avatar';
import { CheckBox } from '../CheckBox';

import { randomInt } from '../../utils';

interface IRadioListProps {
  title: string;
  dataList: Record<string, any>[];
  radioPos?: string;
  initialIndex?: number;
  onClose: () => void;
  onConfirm?: (data: Record<string, any>) => void;
  loadMoreData?: () => void;
  textStyle?: TextStyle;
}

interface IRadioItemProps {
  data: IRadioItemData;
  radioPos?: string;
  index: number;
  checkedIndex: number;
  setCheckedIndex: (checkedIndex: number) => void;
  textStyle?: TextStyle;
}

interface IRadioItemData {
  icon?: string; // render member avatar or item icon
  text: string;
  mark?: string; // render member mark or other mark
}

export const RadioList = (props: IRadioListProps) => {
  const {
    title,
    radioPos,
    dataList,
    initialIndex = -1,
    onClose,
    onConfirm,
    loadMoreData,
    textStyle,
  } = props;

  const [checkedIndex, setCheckedIndex] = useState<number>(initialIndex);

  const _setCheckedIndex = (index: number) => {
    setCheckedIndex(index);
  };

  const _onConfirm = () => {
    if (checkedIndex > -1) {
      const data = dataList[checkedIndex];
      onConfirm && onConfirm(data);
    }
  };

  const _loadMoreData = () => {
    loadMoreData && loadMoreData();
  };

  const preventDefault = (event: any) => {
    event.preventDefault();
  };

  return (
    <TouchableWithoutFeedback onPressIn={preventDefault}>
      <View style={styles.radioListContainer}>
        <TouchableOpacity
          style={styles.headerContainer}
          delayPressIn={0}
          activeOpacity={1}
          onPress={onClose}
        >
          <Text style={styles.title}>{title}</Text>
          <Image
            style={styles.closeIcon}
            source={require('../../assets/close-gray.png')}
          />
        </TouchableOpacity>
        <FlatList
          data={dataList}
          renderItem={({ item, index }) => (
            <RadioItem
              key={index}
              radioPos={radioPos}
              data={item}
              index={index}
              checkedIndex={checkedIndex}
              setCheckedIndex={_setCheckedIndex}
              textStyle={textStyle}
            />
          )}
          keyExtractor={item => `${item.text}-${randomInt()}`}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => { _loadMoreData(); }}
        />
        {radioPos && (
          <TouchableOpacity
            delayPressIn={0}
            activeOpacity={1}
            style={[
              styles.confirmContainer,
              checkedIndex > -1 && styles.activeConfirmContainer,
            ]}
            onPress={_onConfirm}
          >
            <Text style={styles.confirmText}>{TUITranslateService.t('Common.CONFIRM')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const RadioItem = (props: IRadioItemProps) => {
  const {
    radioPos,
    data,
    index,
    checkedIndex,
    setCheckedIndex,
    textStyle,
  } = props;

  const _setCheckedIndex = () => {
    setCheckedIndex && setCheckedIndex(index);
  };

  return (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      onPress={_setCheckedIndex}
    >
      <View style={[styles.radioItem, radioPos === 'right' && styles.radioRight]}>
        {radioPos === 'left' && (
          <CheckBox
            checked={checkedIndex === index}
            containerStyle={styles.checkBoxContainer}
          />
        )}
        {data.icon && (
          <Avatar
            uri={data.icon}
            size={40}
            radius={20}
            styles={styles.icon}
          />
        )}
        <Text
          style={[styles.text, textStyle]}
          numberOfLines={1}
        >
          {data.text}
        </Text>
        {data.mark && (
          <Text style={styles.mark}>{data.mark}</Text>
        )}
        {radioPos === 'right' && (
          <CheckBox
            checked={checkedIndex === index}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioListContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  radioItem: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  radioRight: {
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 16,
  },
  text: {
    width: 160,
    fontSize: 14,
    color: '#000000',
  },
  mark: {
    color: '#1890FF',
    fontSize: 10,
    marginLeft: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1890FF',
    backgroundColor: '#108EE91A',
  },
  checkBoxContainer: {
    marginRight: 8,
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
