import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import TUIChatEngine, { type IMessageModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { MessageActionsEnum } from '../../MessageActions/ActionsPanel';
import { useChatContext } from '../../../context';

interface IMessageRecallProps {
  message: IMessageModel;
}

export const MessageRecall = (props: IMessageRecallProps) => {
  const { setActionsMessageModel } = useChatContext();
  const { message } = props;

  const messageReEdit = () => {
    setActionsMessageModel({ [MessageActionsEnum.RECALL]: message });
  };
  return (
    <View style={styles.container}>
      {message?.flow === 'in'
        ? (<Text>{message?.nick || message?.from}</Text>)
        : (<Text>{TUITranslateService.t('Chat.YOU')}</Text>)}

      <Text style={styles.recalledMessage}>
        {TUITranslateService.t('Chat.REVOKED_MESSAGE')}
      </Text>

      {message?.flow === 'out' && message?.type === TUIChatEngine.TYPES.MSG_TEXT && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={messageReEdit}
        >
          <Text style={styles.reCallText}>
            {TUITranslateService.t('Chat.RE_EDIT')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    color: '#F1F1F1',
  },
  reCallText: {
    color: '#147aff',
    fontSize: 12,
  },
  recalledMessage: {
    paddingRight: 5,
  },
});
