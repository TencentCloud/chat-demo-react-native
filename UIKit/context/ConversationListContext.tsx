import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import TUIChatEngine,
{ StoreName,
  TUIConversationService,
  TUIStore,
  TUIGroupService,
  type IConversationModel,
  type CreateGroupParams,
} from '@tencentcloud/chat-uikit-engine';
import { TUILogin } from '@tencentcloud/tui-core';
import { Friend, Profile } from '@tencentcloud/chat';

import { ICreateGroupOptions } from '../components/ConversationCreate';

export interface ConversationListProviderProps {
  /** Specifies a function to filter conversations in the conversation list. */
  filter?: (conversationList: IConversationModel[]) => IConversationModel[];
  /** Specifies a function to sort conversations in the conversation list. */
  sort?: (conversationList: IConversationModel[]) => IConversationModel[];
  onPressConversation?: (conversation?: IConversationModel) => void;
}

export interface ConversationListContextType {
  conversationList: IConversationModel[];
  currentActivator?: IConversationModel;
  setCurrentActivator: (conversation?: IConversationModel) => void;
  filteredAndSortedConversationList: IConversationModel[];
  currentConversation: IConversationModel | undefined;
  setCurrentConversation: (conversation: IConversationModel) => void;
  setConversationCreateShow: (isCreate: boolean) => void;
  isConversationCreateShow: boolean;
  isLoading: boolean;
  isLoadError: boolean;
  markConversationUnread: (conversation: IConversationModel, markUnRead?: boolean) => void;
  setMessageRead: (conversation: IConversationModel) => void;
  onPressConversation?: (conversation?: IConversationModel) => void;
  createGroup: (param: ICreateGroupOptions) => Promise<any>;
  friendList: Array<Friend>;
  setFriendList: (list: Array<Friend>) => void;
  userProfile: Profile;
}

const ConversationListContext = React.createContext<ConversationListContextType | null>(null);
export function ConversationListProvider(props: PropsWithChildren<ConversationListProviderProps>) {
  const {
    filter,
    sort,
    onPressConversation,
    children,
  } = props;

  const [conversationList, setConversationList] = useState<IConversationModel[]>([]);
  const [currentActivator, _setCurrentActivator] = useState<IConversationModel | undefined>(undefined);
  const [currentConversation, _setCurrentConversation] = useState<IConversationModel | undefined>(undefined);
  const [filteredAndSortedConversationList, setFilteredAndSortedConversationList] = useState<IConversationModel[]>([]);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [userProfile, setUserProfile] = useState<Profile>(null!);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadError, setIsLoadError] = useState(false);
  const [isConversationCreateShow, setConversationCreateShow] = useState(false);

  const { chat } = TUILogin.getContext();

  useEffect(() => {
    TUIStore.watch(StoreName.CONV, {
      conversationList: onConversationListUpdated,
      currentConversation: onCurrentConversationUpdated,
    });
    TUIStore.watch(StoreName.USER, {
      netStateChange: onNetStateChange,
      userProfile: onUserProfileUpdated,
    });
    TUIStore.watch(StoreName.FRIEND, {
      friendList: onFriendListUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.CONV, {
        conversationList: onConversationListUpdated,
        currentConversation: onCurrentConversationUpdated,
      });
      TUIStore.unwatch(StoreName.USER, {
        netStateChange: onNetStateChange,
        userProfile: onUserProfileUpdated,
      });
      TUIStore.unwatch(StoreName.FRIEND, {
        friendList: onFriendListUpdated,
      });
    };
  });

  useEffect(() => {
    // filter & sort conversationList
    let _conversationList = conversationList;
    filter && (_conversationList = filter(_conversationList));
    sort && (_conversationList = sort(_conversationList));
    setFilteredAndSortedConversationList(_conversationList);
  }, [conversationList, sort, filter]);

  const onUserProfileUpdated = (profile: Profile) => {
    setUserProfile(profile);
  };

  const onConversationListUpdated = (list: IConversationModel[]) => {
    setConversationList(list);
    if (isLoading) {
      setIsLoading(false);
    }
  };

  const setCurrentActivator = (conversation?: IConversationModel) => {
    if (conversation) {
      const newConversation = TUIStore.getConversationModel(conversation.conversationID);
      _setCurrentActivator(newConversation);
    } else {
      _setCurrentActivator(undefined);
    }
  };

  const onCurrentConversationUpdated = (conversation: IConversationModel) => {
    _setCurrentConversation(conversation);
  };

  const onNetStateChange = (netState: string) => {
    if (netState === TUIChatEngine.TYPES.NET_STATE_DISCONNECTED) {
      setIsLoadError(true);
    } else {
      setIsLoadError(false);
    }
  };

  const setCurrentConversation = (conversation: IConversationModel) => {
    markConversationUnread(conversation, false);
    TUIConversationService.switchConversation(conversation?.conversationID);
  };

  const createGroup = (param: ICreateGroupOptions) => {
    const { groupID, type, name, memberList, avatar } = param;
    const groupOptions: CreateGroupParams = {
      groupID,
      type: type as any,
      name,
      memberList: memberList as any,
      avatar,
    };
    if (groupID && type === TUIChatEngine.TYPES.GRP_COMMUNITY) {
      groupOptions.groupID = `@TGS#_${groupID}`;
    }
    if (type === TUIChatEngine.TYPES.GRP_PUBLIC) {
      groupOptions.joinOption = TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS;
    }
    return TUIGroupService.createGroup(groupOptions).then((res) => {
      const _groupID = res.data.group.groupID;
      const conversationID = `GROUP${_groupID}`;
      if (type === TUIChatEngine.TYPES.GRP_AVCHATROOM) {
        TUIGroupService.joinGroup({
          groupID: _groupID,
        });
      }
      return conversationID;
    })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  const markConversationUnread = (conversation: IConversationModel, markUnRead: boolean = true) => {
    // TODO: Implement the markConversationUnread using TUIChatEngine
    chat.markConversation({
      conversationIDList: [conversation.conversationID],
      markType: TUIChatEngine.TYPES.CONV_MARK_TYPE_UNREAD,
      enableMark: markUnRead,
    });
  };

  const setMessageRead = (conversation: IConversationModel) => {
    if (conversation.unreadCount > 0) {
      // TODO: Implement the setMessageRead using TUIChatEngine
      chat.setMessageRead({ conversationID: conversation.conversationID });
    }
  };

  function onFriendListUpdated(list: Friend[]) {
    setFriendList(list);
  }

  const value = {
    conversationList,
    currentActivator,
    setCurrentActivator,
    filteredAndSortedConversationList,
    currentConversation,
    setCurrentConversation,
    isLoading,
    isLoadError,
    onPressConversation,
    markConversationUnread,
    setMessageRead,
    setConversationCreateShow,
    isConversationCreateShow,
    createGroup,
    friendList,
    userProfile,
    setFriendList,
  };

  return (
    <ConversationListContext.Provider value={value}>
      {children}
    </ConversationListContext.Provider>
  );
}

export function useConversationListContext() {
  const context = useContext(ConversationListContext);
  if (!context) {
    throw new Error('useConversationList must be used within a useConversationList');
  }
  return context;
}
