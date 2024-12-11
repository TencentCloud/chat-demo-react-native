import { Platform, Dimensions } from 'react-native';

export const getWindowSize = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const isIOSMini = getWindowSize().height <= 568;
