import {useCallback, useEffect, useState} from 'react';
import {
  HistoryMsgGetTypeEnum,
  TencentImSDKPlugin,
  V2TimAdvancedMsgListener,
  V2TimConversation,
} from 'react-native-tim-js';
import {MessageDownload} from '../utils/message_download';
import {
  addMessageItem,
  revokeMessage,
  setMessage,
  updateMessage,
  updateMessageProgress,
  useTUIChatContext,
} from '../store';

export const useMessageList = (conversation: V2TimConversation) => {
  //   const [message, setMessage] = useState<V2TimMessage[]>([]);
  const [loading] = useState(false);
  //   const [haveMore, setHaveMore] = useState(true);
  const {dispatch} = useTUIChatContext();

  const loadMore = useCallback(
    async ({
      userID,
      groupID,
      lastMsgID,
    }: {
      userID?: string;
      groupID?: string;
      lastMsgID?: string;
    }) => {
      try {
        if (!userID && !groupID) {
          return;
        }
        // setLoading(true);
        const isUIKit =
          TencentImSDKPlugin.v2TIMManager.getUIKitIdentification();
        if (!isUIKit) {
          throw new Error('Pleade pass isUIkit field at initialization!');
        }
        const response = await TencentImSDKPlugin.v2TIMManager
          .getMessageManager()
          .getHistoryMessageList(
            10,
            HistoryMsgGetTypeEnum.V2TIM_GET_CLOUD_OLDER_MSG,
            userID === 'null' || userID === '' ? undefined : userID,
            groupID === 'null' || groupID === '' ? undefined : groupID,
            undefined,
            lastMsgID,
          );
        if (response.code === 0) {
          const responseMessageList = response.data ?? [];
          if (responseMessageList.length === 0) {
            return;
          }
          if (lastMsgID) {
            dispatch(updateMessage(responseMessageList));
          } else {
            dispatch(setMessage(responseMessageList));
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        // setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const {userID, groupID} = conversation;
    loadMore({
      userID,
      groupID,
    });
    const adVancedMessageListener: V2TimAdvancedMsgListener = {
      onRecvNewMessage(message) {
        const convID = message?.userID ?? message.groupID;
        if (convID === userID || convID === groupID) {
          dispatch(addMessageItem(message));
        }
      },
      onMessageDownloadProgressCallback(messageProgress) {
        if (MessageDownload.avoidUpdateTask.includes(messageProgress.msgID)) {
          if (messageProgress.isFinish) {
            MessageDownload.avoidUpdateTask =
              MessageDownload.avoidUpdateTask.filter(
                item => item !== messageProgress.msgID,
              );
          }
          return;
        }
        if (messageProgress.isFinish) {
          dispatch(
            updateMessageProgress({
              msgID: messageProgress.msgID,
              progress: 1,
            }),
          );
          MessageDownload.doTask();
          return;
        }
        if (messageProgress.isError) {
          MessageDownload.doTask();
          return;
        }

        if (messageProgress.totalSize !== -1) {
          const progrss =
            messageProgress.currentSize / messageProgress.totalSize;
          if (progrss > 1) {
            dispatch(
              updateMessageProgress({
                msgID: messageProgress.msgID,
                progress: progrss,
              }),
            );
            return;
          }
        }
      },
      onRecvMessageRevoked(msgID) {
        dispatch(
          revokeMessage({
            msgID,
          }),
        );
      },
    };
    TencentImSDKPlugin.v2TIMManager
      .getMessageManager()
      .addAdvancedMsgListener(adVancedMessageListener);

    return () => {
      TencentImSDKPlugin.v2TIMManager
        .getMessageManager()
        .removeAdvancedMsgListener(adVancedMessageListener);
    };
  }, [conversation, dispatch, loadMore]);

  return {loading, loadMore};
};
