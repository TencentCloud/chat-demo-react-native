import { useEffect, useState } from 'react';
import { TencentImSDKPlugin, V2TimUserFullInfo } from 'react-native-tim-js';

export const useLoginUser = (loginUserID: string) => {
  const [userInfo, setUserInfo] = useState<V2TimUserFullInfo>();
  useEffect(() => {
    TencentImSDKPlugin.v2TIMManager
      .getUsersInfo([loginUserID])
      .then((response) => {
        const { code, data } = response;
        if (code === 0 && data) {
          setUserInfo(data[0]);
        }
      });
  }, [loginUserID]);
  return userInfo;
};
