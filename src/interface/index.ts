import {V2TimConversation, V2TimFriendInfo, V2TimGroupInfo, V2TimMessage} from 'react-native-tim-js';
import { V2TimFriendApplication } from 'react-native-tim-js/lib/typescript/src/interface/v2TimFriendApplication';

export type RootStackParamList = {
  Home: {userID: string};
  Login: undefined;
  Chat: {
    conversation: V2TimConversation;
    userID: string;
    initialMessageList: V2TimMessage[];
    unMount: (messageList: V2TimMessage[]) => void;
  };
  MergerMessageScreen: {
    message: V2TimMessage;
  };
  GroupList:{
    groupList:V2TimGroupInfo[];
    onGroupTap?:(group:V2TimGroupInfo) => void;
  };
  BlockList:{
    blockList:V2TimFriendInfo[];
  };
  FriendApplicationList:{
    applicationList:V2TimFriendApplication[];
  }
};
