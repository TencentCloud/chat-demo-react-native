import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  TUIChatService,
  TUIGroupService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { PopConfirm } from '../../../../PopConfirm';

import { ProfileItem, IProfileItemProps } from '../ProfileItem';
import { MemberList } from '../MemberList';

import {
  canIDismissGroup,
  canITransferOwner,
  canILeaveGroup,
} from '../../../utils';

interface IGroupActionProps {
  groupID: string;
  type: string;
  role: string;
  navigateToConversationList?: () => void;
}

const ACTION_TYPE = {
  CLEAR_CHAT_HISTORY: 1,
  DISMISS_GROUP: 2,
  LEAVE_GROUP: 3,
};

export const GroupAction = (props: IGroupActionProps) => {
  const {
    groupID,
    type,
    role,
    navigateToConversationList,
  } = props;

  const [memberListVisible, setMemberListVisible] = useState<boolean>(false);
  const [showPopConfirm, setShowPopConfirm] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<number>(0);
  const [confirmTitle, setConfirmTitle] = useState<string>('');

  const clearChatHistory = async () => {
    try {
      await TUIChatService.clearHistoryMessage(`GROUP${groupID}`);
    } catch (error) {}
  };

  const dismissGroup = async () => {
    try {
      await TUIGroupService.dismissGroup(groupID);
      navigateToConversationList && navigateToConversationList();
    } catch (error) {}
  };

  const transferGroupOwner = async (data: Record<string, any>) => {
    setMemberListVisible(false);
    try {
      await TUIGroupService.changeGroupOwner({
        groupID,
        newOwnerID: data.userID,
      });
    } catch (error) {}
  };

  const leaveGroup = async () => {
    try {
      await TUIGroupService.quitGroup(groupID);
      navigateToConversationList && navigateToConversationList();
    } catch (error) {}
  };

  const onPressActionItem = (currentAction: number) => {
    switch (currentAction) {
      case ACTION_TYPE.CLEAR_CHAT_HISTORY:
        setConfirmTitle(TUITranslateService.t('ChatSetting.CONFIRM_CLEAR_HISTORY'));
        break;
      case ACTION_TYPE.DISMISS_GROUP:
        setConfirmTitle(TUITranslateService.t('ChatSetting.CONFIRM_DISBAND'));
        break;
      case ACTION_TYPE.LEAVE_GROUP:
        setConfirmTitle(TUITranslateService.t('ChatSetting.CONFIRM_LEAVE'));
        break;
    }
    setCurrentAction(currentAction);
    setShowPopConfirm(true);
  };

  const onConfirm = () => {
    setShowPopConfirm(false);
    switch (currentAction) {
      case ACTION_TYPE.CLEAR_CHAT_HISTORY:
        clearChatHistory();
        break;
      case ACTION_TYPE.DISMISS_GROUP:
        dismissGroup();
        break;
      case ACTION_TYPE.LEAVE_GROUP:
        leaveGroup();
        break;
    }
  };

  const onCancel = () => {
    setShowPopConfirm(false);
    setCurrentAction(0);
  };

  const getActionItemList = () => {
    const actionItemList: IProfileItemProps[] = [
      {
        name: TUITranslateService.t('ChatSetting.CLEAR_CHAT_HISTORY'),
        isShowArrowNext: false,
        containerStyle: styles.clearChatHistoryItem,
        nameStyle: styles.nameStyle,
        onPress: () => onPressActionItem(ACTION_TYPE.CLEAR_CHAT_HISTORY),
      },
    ];
    if (canIDismissGroup(role, type)) {
      actionItemList.push(
        {
          name: TUITranslateService.t('ChatSetting.DISBAND_GROUP'),
          isShowArrowNext: false,
          nameStyle: styles.nameStyle,
          onPress: () => onPressActionItem(ACTION_TYPE.DISMISS_GROUP),
        },
      );
    }
    if (canITransferOwner(role, type)) {
      actionItemList.push(
        {
          name: TUITranslateService.t('ChatSetting.TRANSFER_OWNER'),
          isShowArrowNext: false,
          nameStyle: styles.nameStyle,
          onPress: () => setMemberListVisible(true),
        },
      );
    }
    if (canILeaveGroup(role, type)) {
      actionItemList.push(
        {
          name: TUITranslateService.t('ChatSetting.LEAVE_GROUP'),
          isShowArrowNext: false,
          nameStyle: styles.nameStyle,
          onPress: () => onPressActionItem(ACTION_TYPE.LEAVE_GROUP),
        },
      );
    }

    // last item needs to add margin bottom
    actionItemList[actionItemList.length - 1].containerStyle = StyleSheet.flatten([
      actionItemList[actionItemList.length - 1].containerStyle,
      styles.lastItem,
    ]);

    return actionItemList;
  };

  return (
    <>
      {getActionItemList().map((item, index) => {
        return (
          <ProfileItem
            key={index}
            icon={item.icon}
            name={item.name}
            content={item.content}
            isShowArrowNext={item.isShowArrowNext}
            containerStyle={item.containerStyle}
            nameStyle={item.nameStyle}
            contentStyle={item.contentStyle}
            onPress={item.onPress}
          />
        );
      })}
      <MemberList
        memberListVisible={memberListVisible}
        title={TUITranslateService.t('ChatSetting.TRANSFER_OWNER')}
        groupID={groupID}
        filterMySelf={true}
        radioPos="left"
        onClose={() => setMemberListVisible(false)}
        onConfirm={transferGroupOwner}
      />
      <PopConfirm
        isVisible={showPopConfirm}
        title={confirmTitle}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  clearChatHistoryItem: {
    marginTop: 16,
  },
  nameStyle: {
    color: '#FF584C',
  },
  lastItem: {
    marginBottom: 120,
  },
});
