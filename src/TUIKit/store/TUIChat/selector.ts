import type { V2TimMessage } from 'react-native-tim-js';
import { HISTORY_MESSAGE_DISTANCE } from '../../constants';
import { useTUIChatContext } from './context';

export const useMessageList = () => {
  const {
    state: { messageList },
  } = useTUIChatContext();
  const lastMsgId = messageList[messageList.length - 1]?.msgID;

  const listWithTimestamp: V2TimMessage[] = [];
  [...messageList].reverse().map((item) => {
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
