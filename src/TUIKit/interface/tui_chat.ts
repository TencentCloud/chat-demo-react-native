import type {PropsWithChildren} from 'react';
import type {V2TimConversation, V2TimMessage} from 'react-native-tim-js';

export type MessageElement = React.ComponentType<{message: V2TimMessage}>;

export interface TUIChatProps {
  conversation: V2TimConversation;
  loginUserID: string;
  showChatHeader: boolean;
  initialMessageList?: V2TimMessage[];
  messageItemOption?: IMessageItemOption;
  textInputOption?: ITextInput;
  unMount?: (message: V2TimMessage[]) => void;
  onMergeMessageTap?: (message: V2TimMessage) => void;
}

interface IMessageItemOption extends Partial<BaseElements> {
  showNickName?: boolean;
  showAvatar?: boolean;
  ItemComponent?: MessageElement;
  AvatarComponent?: MessageElement;
}


export interface BaseElements {
  TextElement: MessageElement;
  ImageElement: MessageElement;
  MessageBubble: PropsWithChildren<MessageElement>;
  TimeElement: MessageElement;
  AudioElement: MessageElement;
  FileElement: MessageElement;
  VideoElement: MessageElement;
  RevokeElement: MessageElement;
  ReplyElement: MessageElement;
  CustomElement: MessageElement;
  FaceElement: MessageElement;
  LocationElement: MessageElement;
  GroupTipsElement: MessageElement;
  MergerElement: MessageElement;
  MessageAvatar: MessageElement;
}

interface ITextInput {
  showSound?: boolean;
  showFace?: boolean;
  showToolBox?: boolean;
}
