import React, {useEffect, useState} from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../interface';
import {TencentImSDKPlugin, LogLevelEnum} from 'react-native-tim-js';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LOGIN_USER_ID = '940928';
const USER_SIG =
  'eJwtzLEOgjAUheF36aqBS8u1lMRNjAOJgy4YFmML3hCxqVWbGN9dBMbzneT-sGN5iF7GsZzxCNhy3KRN76mhkVUKimfz89Dd2VrSLE9SgCSTAvn0mGDJmcERkQPApJ5uf1vJTAlUKp0r1A7hro67wotd82yqUvXvzWJfJCgvhmPYehn0-SpA2FPl6hjW7PsDJsQwvw__';

function LoginScreen({navigation}: Props) {
  const [userID, setUserID] = useState(LOGIN_USER_ID);
  const [userSig, setUserSig] = useState(USER_SIG);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await TencentImSDKPlugin.v2TIMManager.initSDK(
      1400187352,
      LogLevelEnum.V2TIM_LOG_DEBUG,
    );
  };

  const login = async () => {
    const {code} = await TencentImSDKPlugin.v2TIMManager.login(userID, userSig);
    if (code === 0) {
      navigation.navigate('Home', {
        userID: userID,
      });
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="userID"
        style={styles.textInput}
        onChangeText={setUserID}
        value={userID}
      />
      <TextInput
        placeholder="userSig"
        value={userSig}
        onChangeText={setUserSig}
        style={[
          styles.textInput,
          {
            marginBottom: 10,
          },
        ]}
      />
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
