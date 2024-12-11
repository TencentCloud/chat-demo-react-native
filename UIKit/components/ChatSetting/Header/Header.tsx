import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

export interface IHeaderProps {
  title: string;
  navigateBack?: () => void;
}

export const Header = (props: IHeaderProps) => {
  const { title, navigateBack } = props;

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={styles.gobackArea}
        onPress={navigateBack}
      >
        <Image
          style={styles.gobackIcon}
          source={require('../../../assets/arrow-back.png')}
        />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
  },
  gobackArea: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gobackIcon: {
    width: 9,
    height: 16,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginRight: 40,
  },
});
