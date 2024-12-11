import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUILogin } from '@tencentcloud/tui-core';
import { pushInit } from './push';

export interface LoginInfo {
  SDKAppID: number;
  userID: string;
  userSig: string;
  appKey: string;
}

export const LoginChat = async (data: LoginInfo, callback: Function) => {
  TUILogin.login({
    SDKAppID: data.SDKAppID,
    userID: data.userID,
    userSig: data.userSig,
    useUploadPlugin: true,
    framework: 'rn',
  }).then(() => {
    pushInit(data);
    try {
      AsyncStorage.setItem('userInfo', JSON.stringify(data));
      callback && callback();
    } catch (error) {
      throw error;
    }
  });
};

export const LoginUsingStorageInfo = async (callback: Function) => {
  try {
    const value = await AsyncStorage.getItem('userInfo');
    if (value !== null) {
      const userInfo = JSON.parse(value);
      LoginChat(userInfo, callback);
    }
  } catch (error) {
    throw error;
  }
};

export const LogoutChat = async (callback: Function) => {
  AsyncStorage.removeItem('userInfo');
  TUILogin.logout().then(() => {
    callback && callback();
  }).catch(() => {
    callback && callback();
  });
};
