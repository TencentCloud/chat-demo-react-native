import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';

import TUIChatEngine,
{
  TUIStore,
  StoreName,
  TUIGroupService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../../Overlay';

import { MentionUserList } from './MentionUserList';

import { useChatContext } from '../../../context';

import { AVATAR_MENTION_ALL, USER_AVATAR_DEFAULT } from '../../../constant';

// you can replace  MentionUserList and data.
export const Mention = () => {
  const { mentionText, setMentionText, setMentionUserList } = useChatContext();
  const [showMentionUserList, setShowMentionUserList] = useState<boolean>(false);
  const [userList, setUserList] = useState<any>([]);
  const groupID = TUIStore.getData(StoreName.GRP, 'currentGroupID');

  useEffect(() => {
    if (mentionText.endsWith('@')) {
      setShowMentionUserList(true);
    }
  }, [mentionText]);

  useEffect(() => {
    TUIStore.watch(StoreName.GRP, {
      currentGroupMemberList: onCurrentGroupMemberListUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.GRP, {
        currentGroupMemberList: onCurrentGroupMemberListUpdated,
      });
    };
  }, []);

  const onCurrentGroupMemberListUpdated = (_memberList: Record<string, any>[]) => {
    setUserList(_memberList);
  };

  const handelDataList = () => {
    const myUserID = TUIChatEngine.getMyUserID();
    const dataList = userList
      .filter((item: Record<string, any>) => item.userID !== myUserID)
      .map((item: Record<string, any>) => {
        return {
          userID: item.userID,
          avatar: item.avatar || USER_AVATAR_DEFAULT,
          text: item.nick || item.userID,
        };
      });
    dataList.unshift({
      userID: TUIChatEngine.TYPES.MSG_AT_ALL,
      avatar: AVATAR_MENTION_ALL,
      text: TUITranslateService.t('Conversation.MENTION_ALL'),
    });
    return dataList;
  };

  const loadMoreData = () => {
    const isCompleted = TUIStore.getData(StoreName.GRP, 'isCompleted');
    if (!isCompleted) {
      try {
        TUIGroupService.getGroupMemberList({ groupID });
      } catch (error) {}
    }
  };

  const onCheckedConfirm = (dataList: Record<string, any>[]) => {
    let text = mentionText.endsWith('@') ? mentionText.slice(0, -1) : mentionText;
    const mentionUserList: string[] = [];
    dataList.forEach((item) => {
      text += item.userID === TUIChatEngine.TYPES.MSG_AT_ALL ? `${item.text} ` : `@${item.text} `;
      mentionUserList.push(item.userID);
    });
    setShowMentionUserList(false);
    setMentionText(text);
    setMentionUserList(mentionUserList);
  };

  return (
    <Overlay
      isVisible={showMentionUserList}
      onClose={() => setShowMentionUserList(false)}
    >
      <SafeAreaView>
        <MentionUserList
          dataList={handelDataList()}
          onClose={() => setShowMentionUserList(false)}
          onConfirm={onCheckedConfirm}
          loadMoreData={loadMoreData}
        />
      </SafeAreaView>
    </Overlay>
  );
};
