import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';

import TabBarItem, { type ITabBarItem } from './TabBarItem';

export interface ITabBar extends ITabBarItem {
  activeIcon?: ImageSourcePropType;
}

interface TabBarProps {
  list: ITabBarItem[];
  activeTabBar?: ITabBar;
  activeContainerStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  onPress?: (data?: ITabBar) => void;
}

function UnMemoizedTabBarPreview(props: TabBarProps) {
  const {
    list = [],
    activeTabBar: propActiveTabBar,
    onPress,
    activeContainerStyle,
    activeTextStyle,
  } = props;

  const [tabBarList, setTabBarList] = useState<ITabBar[]>([]);
  const [activeTabBar, setActiveTabBar] = useState<ITabBar>();

  const _onPress = (index: number) => {
    onPress && onPress(tabBarList[index]);
    setActiveTabBar(tabBarList[index]);
  };

  useEffect(() => {
    setTabBarList(list);
    setActiveTabBar(propActiveTabBar);
  }, [propActiveTabBar, list]);

  return (
    <SafeAreaView style={styles.container}>
      {
        tabBarList.map((item, index) => (
          <TabBarItem
            key={`${item.key}-${index}`}
            icon={activeTabBar === item ? item.activeIcon : item.icon}
            text={item.text}
            badge={item.badge}
            index={index}
            containerStyle={activeTabBar === item ? activeContainerStyle : undefined}
            textStyle={activeTabBar === item ? activeTextStyle : undefined}
            onPress={_onPress}
          />
        ))
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9F9F9F0',
  },
});

export const TabBar = React.memo(UnMemoizedTabBarPreview) as typeof UnMemoizedTabBarPreview;
