import React, { PropsWithChildren, useContext, useState, useEffect, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

import TUIChatEngine, {
  TUIChatService,
  TUIGroupService,
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';

import { type ICustomElementProps } from '../components/Message/CustomElement';

import { isIOS } from '../utils';

interface IChatProviderProps {
  navigateBack?: () => void;
  navigateToChatSetting?: () => void;
  enableToolbox?: boolean;
  enableEmoji?: boolean;
  enableVoice?: boolean;
  enableCamera?: boolean;
  CustomElement?: React.ComponentType<ICustomElementProps>;
}

interface ICallbackType {
  (flag?: boolean): void;
}

export interface IChatContextValue extends IChatProviderProps {
  currentConversation?: IConversationModel;
  scrollToBottomDefault: boolean;
  textInputFocused: boolean;
  textInputBlured: boolean;
  emojiPanelOpened: boolean;
  receivedNewMessage: boolean;
  refreshing: boolean;
  messageList: IMessageModel[];
  loadMoreMessage: () => void;
  setTextInputFocused: (value: boolean) => void;
  setTextInputBlured: (value: boolean) => void;
  setEmojiPanelOpened: (value: boolean) => void;
  setScrollToBottomDefault: (value: boolean) => void;
  sendTextMessage: (value: string) => void;
  sendTextAtMessage: (text: string, atUserList: string[]) => void;
  sendFaceMessage: (index: number, data: string) => void;
  takePhoto: (callback?: ICallbackType) => void;
  pickPicture: (callback?: ICallbackType) => void;
  recordVideo: (callback?: ICallbackType) => void;
  pickFile: (callback?: ICallbackType) => void;
  actionsMessageModel: Record<string, IMessageModel>;
  setActionsMessageModel: (value: Record<string, IMessageModel>) => void;
  mentionText: string;
  setMentionText: (value: string) => void;
  mentionUserList: string[];
  setMentionUserList: (value: string[]) => void;
  imagePreviewVisible: boolean;
  setImagePreviewVisible: (value: boolean) => void;
  imagePreviewData: Record<string, any>;
  setImagePreviewData: (value: Record<string, any>) => void;
  hightedMessageID: string;
  setHightedMessageID: (value: string) => void;
  messageListRef: React.MutableRefObject<any>;
  setMessageListRef: (value: React.MutableRefObject<any>) => void;
}

const ChatContext = React.createContext<IChatContextValue | null>(null);

export function ChatProvider(props: PropsWithChildren<Partial<IChatProviderProps>>) {
  const { children } = props;

  const [currentConversation, setCurrentConversation] = useState<IConversationModel>();
  const [scrollToBottomDefault, setScrollToBottomDefault] = useState<boolean>(true);
  const [receivedNewMessage, setReceivedNewMessage] = useState<boolean>(false);
  const [textInputFocused, setTextInputFocused] = useState<boolean>(false);
  const [textInputBlured, setTextInputBlured] = useState<boolean>(false);
  const [emojiPanelOpened, setEmojiPanelOpened] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<IMessageModel[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionsMessageModel, setActionsMessageModel] = useState<Record<string, IMessageModel>>({});
  const [mentionText, setMentionText] = useState<string>('');
  const [mentionUserList, setMentionUserList] = useState<string[]>([]);
  const [imagePreviewVisible, setImagePreviewVisible] = useState<boolean>(false);
  const [imagePreviewData, setImagePreviewData] = useState<Record<string, any>>({});
  const [hightedMessageID, setHightedMessageID] = useState<string>('');
  const [messageListRef, setMessageListRef] = useState<React.MutableRefObject<any>>(useRef(null));

  useEffect(() => {
    TUIStore.watch(StoreName.CONV, {
      currentConversationID: onCurrentConversationIDUpdated,
      currentConversation: onCurrentConversationUpdated,
    });
    TUIStore.watch(StoreName.CHAT, {
      messageList: onMessageListUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.CONV, {
        currentConversationID: onCurrentConversationIDUpdated,
        currentConversation: onCurrentConversationUpdated,
      });
      TUIStore.unwatch(StoreName.CHAT, {
        messageList: onMessageListUpdated,
      });
    };
  }, []);

  const onCurrentConversationIDUpdated = (conversationID: string) => {
    if (conversationID && conversationID.startsWith(TUIChatEngine.TYPES.CONV_GROUP)) {
      const groupID = conversationID.replace(TUIChatEngine.TYPES.CONV_GROUP, '');
      TUIGroupService.switchGroup(groupID);
    }
  };

  const onCurrentConversationUpdated = (conversation: IConversationModel) => {
    setCurrentConversation(conversation);
  };

  const onMessageListUpdated = (list: IMessageModel[]) => {
    // Received push message scroll to bottom.
    if (list.length > messageList.length && list[0]?.time === messageList[0]?.time) {
      setReceivedNewMessage(true);
    } else {
      setReceivedNewMessage(false);
    }
    const newList = list.filter(item => !item.isDeleted);
    setMessageList(newList);
  };

  const loadMoreMessage = () => {
    const isCompleted = TUIStore.getData(StoreName.CHAT, 'isCompleted');
    if (refreshing || isCompleted) {
      return;
    }
    setScrollToBottomDefault(false);
    setRefreshing(true);
    TUIChatService.getMessageList()
      .catch(() => {})
      .finally(() => {
        setRefreshing(false);
      });
  };

  const sendTextMessage = (text: string) => {
    TUIChatService.sendTextMessage({
      payload: { text },
    }).catch(() => {});
  };

  const sendTextAtMessage = (text: string, atUserList: string[]) => {
    TUIChatService.sendTextAtMessage({
      payload: {
        text,
        atUserList,
      },
    }).catch(() => {});
  };

  const sendFaceMessage = (index: number, data: string) => {
    TUIChatService.sendFaceMessage({
      payload: {
        index,
        data,
      },
    }).catch(() => {});
  };

  const takePhoto = (callback?: ICallbackType) => {
    if (callback) {
      // only update toolbox opacity for ios, close toolbox for android
      isIOS ? callback(true) : callback();
    }
    launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
    }).then((res: any) => {
      isIOS && callback && callback(); // close toolbox for ios
      setLocalImageAndVideoInfo(res.assets[0]);
      TUIChatService.sendImageMessage({
        payload: {
          file: res.assets[0],
        },
      });
    }).catch(() => {
      isIOS && callback && callback();
    });
  };

  const pickPicture = (callback?: ICallbackType) => {
    if (callback) {
      // only update toolbox opacity for ios, close toolbox for android
      isIOS ? callback(true) : callback();
    }
    launchImageLibrary({
      mediaType: 'photo',
    }).then((res: any) => {
      isIOS && callback && callback(); // close toolbox for ios
      setLocalImageAndVideoInfo(res.assets[0]);
      TUIChatService.sendImageMessage({
        payload: {
          file: res.assets[0],
        },
      });
    })
      .catch(() => {
        isIOS && callback && callback(); // close toolbox for ios
      });
  };

  const recordVideo = (callback?: ICallbackType) => {
    if (callback) {
      // only update toolbox opacity for ios, close toolbox for android
      isIOS ? callback(true) : callback();
    }
    launchCamera({
      mediaType: 'video',
      cameraType: 'back',
    }).then((res: any) => {
      isIOS && callback && callback(); // close toolbox for ios
      setLocalImageAndVideoInfo(res.assets[0]);
      TUIChatService.sendVideoMessage({
        payload: {
          file: res.assets[0],
        },
      });
    }).catch(() => {
      isIOS && callback && callback(); // close toolbox for ios
    });
  };

  const pickFile = (callback?: ICallbackType) => {
    if (callback) {
      // only update toolbox opacity for ios, close toolbox for android
      isIOS ? callback(true) : callback();
    }
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }).then((res: Record<string, any>) => {
      isIOS && callback && callback(); // close toolbox for ios
      TUIChatService.sendFileMessage({
        payload: {
          file: res[0],
        },
      });
    }).catch(() => {
      isIOS && callback && callback(); // close toolbox for ios
    });
  };

  const setLocalImageAndVideoInfo = (file: Record<string, string | number>) => {
    const { uri, width, height } = file;
    const localImageAndVideoInfo = TUIStore.getData(StoreName.CUSTOM, 'localImageAndVideoInfo') || new Map();
    localImageAndVideoInfo.set(uri, { width, height });
    TUIStore.update(StoreName.CUSTOM, 'localImageAndVideoInfo', localImageAndVideoInfo);
  };

  const value = {
    ...props,
    currentConversation,
    textInputFocused,
    textInputBlured,
    emojiPanelOpened,
    messageList,
    scrollToBottomDefault,
    refreshing,
    receivedNewMessage,
    loadMoreMessage,
    setTextInputFocused,
    setTextInputBlured,
    setEmojiPanelOpened,
    setScrollToBottomDefault,
    sendTextMessage,
    sendTextAtMessage,
    sendFaceMessage,
    takePhoto,
    pickPicture,
    recordVideo,
    pickFile,
    actionsMessageModel,
    setActionsMessageModel,
    mentionText,
    setMentionText,
    mentionUserList,
    setMentionUserList,
    imagePreviewVisible,
    setImagePreviewVisible,
    imagePreviewData,
    setImagePreviewData,
    hightedMessageID,
    setHightedMessageID,
    messageListRef,
    setMessageListRef,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
