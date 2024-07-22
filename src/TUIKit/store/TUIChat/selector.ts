import type { V2TimMessage } from 'react-native-tim-js';
import { HISTORY_MESSAGE_DISTANCE } from '../../constants';
import { useTUIChatContext } from './context';
import { isCustomerServiceMessage, isMessageInvisible } from '../../customer-service-plugin/utils';

export const useMessageList = () => {
  const {
    state: { messageList },
  } = useTUIChatContext();
  const lastMsgId = messageList[messageList.length - 1]?.msgID;

  const listWithTimestamp: V2TimMessage[] = [];
  [...messageList].filter((item) => {
    try {
      if (isCustomerServiceMessage(item) && isMessageInvisible(item)) {
        return false
      }
    } catch (e) {
      console.log(e);
      return true
    }
    return true
  }).reverse().map((item) => {
    if (
      listWithTimestamp.length === 0 ||
      (listWithTimestamp[listWithTimestamp.length - 1] &&
        listWithTimestamp[listWithTimestamp.length - 1]!.timestamp &&
        item.timestamp! -
        listWithTimestamp[listWithTimestamp.length - 1]!.timestamp! >
        HISTORY_MESSAGE_DISTANCE)
    ) {
      listWithTimestamp.push({
        userID: '',
        isSelf: false,
        elemType: 11,
        msgID: `time-divider-${item.timestamp}`,
        timestamp: item.timestamp,
      });
    }

    listWithTimestamp.push(item);
  });
  return {
    messageList: listWithTimestamp.reverse(),
    lastMsgId: lastMsgId,
    messageListWithoutTimestamp: messageList,
  };
};

export const useRepliedMessage = () => {
  const {
    state: { repliedMessage },
  } = useTUIChatContext();

  return repliedMessage;
};
