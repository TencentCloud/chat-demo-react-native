import React from 'react';
import { ChatProvider } from '../../context';
import { ChatHeader as DefaultChatHeader, type IChatHeaderProps } from '../ChatHeader';
import { MessageList as DefaultMessageList, type IMessageListProps } from '../MessageList';
import { MessageInput as DefaultMessageInput, type IMessageInputProps } from '../MessageInput';
import { type ICustomElementProps } from '../Message/CustomElement';

interface IChatProps {
  Header?: React.ComponentType<IChatHeaderProps>;
  MessageList?: React.ComponentType<IMessageListProps>;
  MessageInput?: React.ComponentType<IMessageInputProps>;
  CustomElement?: React.ComponentType<ICustomElementProps>;
  navigateBack?: () => void;
  navigateToChatSetting?: () => void;
  enableToolbox?: boolean;
  enableEmoji?: boolean;
  enableVoice?: boolean;
  enableCamera?: boolean;
}

function UnMemoizedChat(props: IChatProps): React.ReactElement {
  const {
    Header = DefaultChatHeader,
    MessageList = DefaultMessageList,
    MessageInput = DefaultMessageInput,
    CustomElement = null,
    enableToolbox = true,
    enableEmoji = true,
    enableVoice = false,
    enableCamera = true,
    navigateBack,
    navigateToChatSetting,
  } = props;

  return (
    <ChatProvider
      navigateBack={navigateBack}
      navigateToChatSetting={navigateToChatSetting}
      enableToolbox={enableToolbox}
      enableEmoji={enableEmoji}
      enableVoice={enableVoice}
      enableCamera={enableCamera}
      CustomElement={CustomElement}
    >
      <Header />
      <MessageList />
      <MessageInput />
    </ChatProvider>
  );
}

export const Chat = React.memo(UnMemoizedChat) as typeof UnMemoizedChat;
