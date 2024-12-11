import React from 'react';
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

import { Avatar } from '../../../../../Avatar';

import { randomInt } from '../../../../../../utils';

interface IPreviewListProps {
  title: string;
  dataList: Record<string, any>[];
  onPress?: (data: Record<string, any>) => void;
  onClose: () => void;
  loadMoreData?: () => void;
  textStyle?: TextStyle;
}

interface IPreviewItemProps {
  data: IPreviewItemData;
  textStyle?: TextStyle;
  onPress?: () => void;
}

interface IPreviewItemData {
  icon?: string; // render member avatar or item icon
  text?: string; // render text
  mark?: string; // render member mark or other mark
  arrowNext?: boolean; // render arrow next which means the item can view more info.
}

export const PreviewList = (props: IPreviewListProps) => {
  const {
    title,
    dataList,
    onPress,
    onClose,
    loadMoreData,
    textStyle,
  } = props;

  const _onPressItem = (index: number) => {
    // arrowNext is true and props has onPress which means the item need to handle press event.
    dataList[index].arrowNext && onPress && onPress(dataList[index]);
  };

  const _loadMoreData = () => {
    loadMoreData && loadMoreData();
  };

  const preventDefault = (event: any) => {
    event.preventDefault();
  };

  return (
    <TouchableWithoutFeedback onPressIn={preventDefault}>
      <View style={styles.previewListContainer}>
        <TouchableOpacity
          style={styles.headerContainer}
          delayPressIn={0}
          activeOpacity={1}
          onPress={onClose}
        >
          <Text style={styles.title}>{title}</Text>
          <Image
            style={styles.closeIcon}
            source={require('../../../../../../assets/close-gray.png')}
          />
        </TouchableOpacity>
        <FlatList
          data={dataList}
          renderItem={({ item, index }) => (
            <PreviewItem
              key={index}
              data={item}
              onPress={() => _onPressItem(index)}
              textStyle={textStyle}
            />
          )}
          keyExtractor={item => `${item.text}-${randomInt()}`}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => _loadMoreData()}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const PreviewItem = (props: IPreviewItemProps) => {
  const { data, textStyle, onPress } = props;

  return (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      onPress={onPress}
    >
      <View style={styles.previewItem}>
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
        {data.arrowNext && (
          <Image
            source={require('../../../../../../assets/arrow-next.png')}
            style={styles.arrowNextIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  previewListContainer: {
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
  previewItem: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
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
  arrowNextIcon: {
    width: 7,
    height: 12,
    marginLeft: 'auto',
  },
});
