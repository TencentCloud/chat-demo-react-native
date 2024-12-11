import React, { forwardRef, Ref } from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

import {
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { useChatContext } from '../../../context/ChatContext';

interface IActionsPanelProps {
  message: IMessageModel;
  recallMessageTimeLimit?: number;
  offsetHeight?: number;
  onLayout?: any;
  style?: ViewStyle;
  onCloseMessageAction: () => void;
}

export enum MessageActionsEnum {
  DELETE = 'delete',
  RECALL = 'recall',
  QUOTE = 'quote',
}

interface IActionsItem {
  key: MessageActionsEnum;
  name: string;
  isShow: boolean;
  style?: ViewStyle;
  icon: ImageSourcePropType;
}
export const ActionsPanel = forwardRef((props: IActionsPanelProps, ref: Ref<View>) => {
  const {
    message,
    style,
    onLayout,
    onCloseMessageAction,
    recallMessageTimeLimit = 120,
  } = props;
  const { setActionsMessageModel } = useChatContext();
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - message.time;
  const isShowRecall = message.flow === 'out' && timeDiff < recallMessageTimeLimit;

  const actionsList: IActionsItem[] = [{
    key: MessageActionsEnum.DELETE,
    name: TUITranslateService.t('Chat.MESSAGE_DELETE'),
    isShow: true,
    icon: require('../../../assets/message-delete.png'),
  },
  {
    key: MessageActionsEnum.RECALL,
    name: TUITranslateService.t('Chat.MESSAGE_REVOKE'),
    isShow: isShowRecall,
    icon: require('../../../assets/message-recall.png'),
  },
  {
    key: MessageActionsEnum.QUOTE,
    name: TUITranslateService.t('Chat.MESSAGE_QUOTE'),
    isShow: true,
    icon: require('../../../assets/message-quote.png'),
  },
  ];

  const handleMessageAction = (type: MessageActionsEnum) => {
    switch (type) {
      case MessageActionsEnum.DELETE:
        message.deleteMessage();
        break;
      case MessageActionsEnum.RECALL:
        message.revokeMessage();
        break;
      case MessageActionsEnum.QUOTE:
        message.quoteMessage();
        setActionsMessageModel({ [MessageActionsEnum.QUOTE]: message });
        break;
      default:
        break;
    }
    onCloseMessageAction();
  };

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={[styles.actionsPanelContainer, style]}
    >
      {actionsList.map(item => item.isShow && (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.5}
          style={[styles.itemContainer, item.style]}
          onPress={() => handleMessageAction(item.key)}
        >
          <Text style={styles.actionText}>{item.name}</Text>
          <Image
            style={styles.actionIcon}
            source={item.icon}
          />
        </TouchableOpacity>
      )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  actionsPanelContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    width: 180,
    borderRadius: 16,
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
  },
  actionText: {
    fontSize: 16,
    color: '#000000',
  },
});
