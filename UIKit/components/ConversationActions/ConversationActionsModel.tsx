import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TextStyle,
} from 'react-native';
import { IConversationModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../Overlay';

export interface ConversationActionsModelProps {
  conversation?: IConversationModel;
  onClose?: (conversation?: IConversationModel) => void;
  isShow?: boolean;
}

export interface IAction {
  name: string;
  handle: (conversation: IConversationModel) => void;
  key?: string;
  value?: boolean;
  style?: TextStyle;
  isRequire?: boolean;
}

const actionMenuList: IAction[] = [
  {
    name: TUITranslateService.t('Conversation.PIN_CHAT'),
    key: 'isPinned',
    value: false,
    isRequire: true,
    handle: (conv: IConversationModel) => {
      conv.pinConversation();
    },
  },
  {
    name: TUITranslateService.t('Conversation.UNPIN_CHAT'),
    key: 'isPinned',
    value: true,
    isRequire: true,
    handle: (conv: IConversationModel) => {
      conv.pinConversation();
    },
  },
  {
    name: TUITranslateService.t('Conversation.MUTE_CHAT'),
    key: 'isMuted',
    value: false,
    isRequire: true,
    handle: (conv: IConversationModel) => {
      conv.muteConversation();
    },
  },
  {
    name: TUITranslateService.t('Conversation.UNMUTE_CHAT'),
    key: 'isMuted',
    value: true,
    isRequire: true,
    handle: (conv: IConversationModel) => {
      conv.muteConversation();
    },
  },
  {
    name: TUITranslateService.t('Conversation.DELETE_CHAT'),
    isRequire: false,
    style: {
      color: '#FF584C',
    },
    handle: (conv: IConversationModel) => {
      conv.deleteConversation();
    },
  },
];

function UnMemoizedConversationActionsModelPreview(props: ConversationActionsModelProps) {
  const {
    conversation,
    onClose,
    isShow = false,
  } = props;

  const [actionList, setActionList] = useState<IAction[]>([]);

  const filterActionList = (conv: IConversationModel) => {
    const list: IAction[] = actionMenuList.filter((item: IAction) => (
      !item.isRequire || (conv as any)[`${item.key}`] === item.value
    ));
    setActionList(list);
  };

  const closeOverlay = () => {
    onClose && onClose(conversation);
  };

  const handleConversation = (action: IAction) => {
    conversation && action.handle(conversation);
    closeOverlay();
  };

  useEffect(() => {
    if (isShow && conversation) {
      filterActionList(conversation);
    }
  }, [isShow, conversation]);

  return (
    <Overlay
      isVisible={isShow}
      style={styles.actionList}
      onClose={closeOverlay}
    >
      {
        actionList.map((item: IAction, index: number) => {
          if (!item.isRequire || (conversation as any)?.[`${item.key}`] === item.value) {
            return (
              <TouchableOpacity
                activeOpacity={1}
                key={index}
                style={[
                  styles.actionItem,
                  index === 0 && styles.actionListStart,
                  index === actionList.length - 1 && styles.actionListEnd]}
                onPress={() => { handleConversation(item); }}
              >
                <Text style={[styles.actionText, item.style]}>{item.name}</Text>
              </TouchableOpacity>
            );
          }
        })
      }
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.actionItem, styles.actionCancel]}
        onPress={closeOverlay}
      >
        <Text style={styles.actionText}>{TUITranslateService.t('Common.CANCEL')}</Text>
      </TouchableOpacity>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  actionList: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 33,
  },
  actionItem: {
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2CC',
    paddingVertical: 17,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FFFFFF',
  },
  actionText: {
    color: '#007AFF',
    fontSize: 17,
    lineHeight: 22,
  },
  actionCancel: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 14,
  },
  actionListStart: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  actionListEnd: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomWidth: 0,
  },
});

export const ConversationActionsModel = React.memo(UnMemoizedConversationActionsModelPreview) as typeof UnMemoizedConversationActionsModelPreview;
