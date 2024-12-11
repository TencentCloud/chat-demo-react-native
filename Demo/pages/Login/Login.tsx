import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { genTestUserSig, APPKey } from '../../debug/GenerateTestUserSig';
import { LoginChat, LoginInfo } from '../../initApp';
import { IRouterParams } from '../../interface';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { useIsFocused } from '@react-navigation/native';

export const Login = ({ navigation }: IRouterParams) => {
  const [value, onChangeText] = useState<string>('');
  const [isPageShow, setIsPageShow] = useState<boolean>(true);

  const onPress = () => {
    if (!value) {
      return;
    }
    const { SDKAppID, userSig } = genTestUserSig(value);
    const data: LoginInfo = {
      SDKAppID,
      userID: value,
      userSig,
      appKey: APPKey,
    };
    LoginChat(data, () => {
      navigation.navigate('Home');
    });
  };

  const onPressLanguage = () => {
    navigation.navigate('Language');
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    setIsPageShow(isFocused);
  }, [isFocused]);

  return isPageShow && (
    <View style={styles.loginContainer}>
      <ImageBackground
        source={require('../../assets/demo_login_bg.png')}
        resizeMode="repeat"
        opacity={0.7}
        style={styles.container}
      >
        <StatusBar backgroundColor="transparent" translucent />
        <View style={styles.activeContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.activeItem}
            onPress={onPressLanguage}
          >
            <Image
              style={styles.icon}
              source={require('../../assets/demo_login_language_icon.png')}
              tintColor="#000000"
            />
            <Text style={styles.text}>{TUITranslateService.t('Login.LANGUAGE')}</Text>
            <Image
              style={styles.iconArrow}
              source={require('../../assets/demo_login_language_arrow.png')}
              tintColor="#000000"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Image style={styles.logo} source={require('../../assets/demo_login_logo.png')} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{TUITranslateService.t('Login.LOGIN_TITLE')}</Text>
            <Text style={styles.subtitle}>{TUITranslateService.t('Login.LOGIN_SUBTITLE')}</Text>
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>UserID</Text>
            <View
              style={styles.input}
            >
              <TextInput
                value={value}
                style={styles.textInput}
                maxLength={11}
                placeholder={TUITranslateService.t('Login.INPUT_PLACEHOLDER')}
                placeholderTextColor="#BBBBBB"
                onChangeText={(text: string) => onChangeText(text)}
              />
            </View>
          </View>
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={StyleSheet.flatten([styles.button, value && styles.isActive])}
              onPress={onPress}
            >
              <Text style={styles.buttonText}>{TUITranslateService.t('Login.LOGIN')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  activeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: StatusBar.currentHeight || 30,
    gap: 5,
  },
  activeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  icon: {
    width: 18,
    height: 18,
  },
  iconArrow: {
    width: 10,
    height: 7,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 13,
  },
  logo: {
    width: 87,
    height: 44,
  },
  titleContainer: {
    flexShrink: 1,
    gap: 4,
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 20,
  },
  inputContainer: {
    flexShrink: 1,
    gap: 10,
  },
  label: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#DDDDDD',
  },
  textInput: {
    flex: 1,
  },
  footerContainer: {
    marginTop: 80,
    paddingHorizontal: 38,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 5,
    backgroundColor: '#2F80ED75',
  },
  isActive: {
    backgroundColor: '#2F80ED',
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
