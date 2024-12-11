import React, { PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { Badge } from '../Badge';

export interface ITabBarItem {
  icon?: ImageSourcePropType;
  activeIcon?: ImageSourcePropType;
  text?: string;
  badge?: string | number;
  key?: string;
}

interface TabBarItemProps extends ITabBarItem {
  index: number;
  onPress?: (index: number) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

function UnMemoizedTabBarItemPreview(props: PropsWithChildren<TabBarItemProps>) {
  const {
    children,
    icon,
    text,
    badge,
    index,
    containerStyle,
    textStyle,
    onPress,
  } = props;

  return (
    <View>
      {
        children || (
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.flatten([styles.container, containerStyle])}
            onPress={() => { onPress && onPress(index); }}
          >
            { icon && (
              <View style={styles.header}>
                <Image
                  style={styles.icon}
                  source={icon}
                />
                { badge && <Badge value={badge} containerStyle={styles.badge} /> }
              </View>
            )}
            {text && (
              <Text style={StyleSheet.flatten([styles.text, textStyle])}>{text}</Text>
            )}
          </TouchableOpacity>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 75,
    height: 50,
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -16,
  },
  text: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: '#0365F9',
  },
  icon: {
    width: 23.5,
    height: 22.45,
  },
});

export default React.memo(UnMemoizedTabBarItemPreview) as typeof UnMemoizedTabBarItemPreview;
