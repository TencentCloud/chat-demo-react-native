import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { LanguageServer, LanguageType } from '../../server';
import { IRouterParams } from '../../interface';

interface ILanguage {
  name: string;
  desc?: string;
  value: LanguageType;
}

const languageList: ILanguage[] = [
  {
    name: '简体中文',
    desc: 'Simple Chinese',
    value: LanguageType.zhCN,
  },
  {
    name: 'English',
    desc: '英语',
    value: LanguageType.enUS,
  },
];

export const Language = ({ navigation }: IRouterParams) => {
  const [currentLanguage, setCurrentLanguage] = React.useState<LanguageType>(LanguageType.enUS);

  const onPress = (data: ILanguage) => {
    setCurrentLanguage(data.value);
    LanguageServer.getInstance().setLanguage(data.value);
  };
  const watchLanguage = (language: LanguageType) => {
    setCurrentLanguage(language);
    navigation.setOptions({ title: TUITranslateService.t('Login.LANGUAGE_TITLE') });
  };

  useEffect(() => {
    LanguageServer.getInstance().on(watchLanguage);
    return () => {
      LanguageServer.getInstance().off(watchLanguage);
    };
  });
  return (
    <View style={styles.container}>
      {
        languageList.map((item, index) => (
          <TouchableOpacity
            activeOpacity={1}
            key={index}
            style={styles.listItem}
            onPress={() => onPress(item)}
          >
            <View style={styles.listItemContent}>
              <Text style={styles.name}>{item.name}</Text>
              {
                currentLanguage === item.value && (<Text style={styles.desc}>{item.desc}</Text>)
              }
            </View>
            {
              currentLanguage === item.value && (
                <Image style={styles.selected} source={require('../../assets/check_box_selected.png')} />
              )
            }
          </TouchableOpacity>
        ))
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  listItem: {
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
    paddingVertical: 5,
    paddingRight: 12,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000014',
  },
  listItemContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  desc: {
    fontSize: 12,
  },
  selected: {
    width: 16,
    height: 16,
  },
});
