import React, {useEffect, useState} from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../interface';
import {TencentImSDKPlugin, LogLevelEnum} from 'react-native-tim-js';
import {LOGIN_USER_ID, SDKAPPID, SECRET, USER_SIG} from './config';
import { TimPushPlugin } from 'react-native-tim-push';
import genTestUserSig from '../utils/generateTestUserSig';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function LoginScreen({navigation}: Props) {
  const [userID, setUserID] = useState('');
  const [userSig, setUserSig] = useState('');
  useEffect(() => {
    init();
  }, []);
  const init = async () => {
    await TencentImSDKPlugin.v2TIMManager.initSDK(
      SDKAPPID,
      LogLevelEnum.V2TIM_LOG_DEBUG,
      undefined,
      true,
    );
  };

  const login = async () => {
    console.log('login pressed');
    const { userSig } = genTestUserSig(userID, SDKAPPID, SECRET);
    setUserSig(userSig);
    const {code,desc} = await TencentImSDKPlugin.v2TIMManager.login(userID, userSig);
    if (code === 0) {
      console.log("====code == 0 =====")
      navigation.navigate('Home', {
        userID: userID,
      });
    }
  };

  const changeUserID = (value:string) => {
    console.log("value",value);
    setUserID(value);
  } 

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="userID"
        style={styles.textInput}
        onChangeText={changeUserID}
        value={userID}
      />
      {/* <TextInput
        placeholder="userSig"
        value={userSig}
        onChangeText={setUserSig}
        style={[
          styles.textInput,
          {
            marginBottom: 10,
          },
        ]}
      /> */}
      <Button title="Login" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 50,
    width: '80%',
    backgroundColor: 'white',
    paddingLeft: 10,
  },
});

export default LoginScreen;
