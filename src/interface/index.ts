import {V2TimConversation, V2TimMessage} from 'react-native-tim-js';

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
};
