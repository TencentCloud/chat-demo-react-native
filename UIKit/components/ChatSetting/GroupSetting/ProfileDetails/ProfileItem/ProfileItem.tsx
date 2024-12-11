import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Avatar } from '../../../../Avatar';

export interface IProfileItemProps {
  icon?: string;
  name?: string;
  content?: string;
  isShowArrowNext?: boolean;
  containerStyle?: ViewStyle;
  nameStyle?: TextStyle;
  contentStyle?: TextStyle;
  onPress?: () => void;
}

export const ProfileItem = (props: IProfileItemProps) => {
  const {
    icon,
    name,
    content,
    isShowArrowNext = true,
    containerStyle,
    nameStyle,
    contentStyle,
    onPress,
  } = props;

  return (
    <TouchableOpacity
      delayPressIn={0}
      activeOpacity={1}
      onPress={onPress}
    >
      <View style={[styles.overviewItem, containerStyle]}>
        {icon && (
          <Avatar
            uri={icon}
            size={24}
            radius={12}
            styles={styles.icon}
          />
        )}
        <Text
          style={[styles.itemName, nameStyle]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {content && (
          <Text
            style={[styles.itemContent, contentStyle]}
            numberOfLines={1}
          >
            {content}
          </Text>
        )}
        {isShowArrowNext && (
          <Image
            style={styles.arrowNextIcon}
            source={require('../../../../../assets/arrow-next.png')}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overviewItem: {
    minHeight: 46,
    backgroundColor: '#F9F9F9F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  itemName: {
    maxWidth: 180,
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
  },
  itemContent: {
    flex: 1,
    textAlign: 'right',
    color: '#000000',
    fontSize: 16,
  },
  arrowNextIcon: {
    width: 7,
    height: 12,
  },
  icon: {
    marginRight: 4,
  },
});
