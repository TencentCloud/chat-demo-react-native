import React, { useEffect, useState } from 'react';
import { Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TencentCloudChat from '@tencentcloud/chat';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

const rightArrow = require('../../assets/right_arrow.png');

interface IConfig {
  name: string;
  value?: string;
  key?: string;
  url?: string;
}

export const About = () => {
  const [configList, setConfigList] = useState<IConfig[]>([]);

  const onPressSetting = (item: IConfig) => {
    item.url && Linking.openURL(item.url);
  };

  useEffect(() => {
    setConfigList([
      {
        name: TUITranslateService.t('About.VERSION'),
        value: (TencentCloudChat as any).VERSION,
      },
      {
        url: 'https://privacy.qq.com/document/preview/1cfe904fb7004b8ab1193a55857f7272',
        name: TUITranslateService.t('About.PRIVACY_POLICY'),
      },
      {
        url: 'https://web.sdk.qcloud.com/document/Tencent-IM-User-Agreement.html',
        name: TUITranslateService.t('About.AGREEMENT'),
      },
      {
        url: 'https://cloud.tencent.com/product/im',
        name: TUITranslateService.t('About.CONTACT'),
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {
        configList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            activeOpacity={1}
            onPress={() => { onPressSetting(item); }}
          >
            <Text
              style={styles.label}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View style={styles.content}>
              <Text
                style={styles.value}
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {item.value}
              </Text>
              {
                item.url && <Image style={styles.icon} source={rightArrow} />
              }
            </View>
          </TouchableOpacity>
        ))
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  settingItem: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#0000001A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    color: '#00000099',
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  value: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },
  icon: {
    width: 15,
    height: 22,
  },
});
