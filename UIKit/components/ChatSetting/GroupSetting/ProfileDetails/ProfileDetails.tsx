import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import TUIChatEngine, { IGroupModel, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { ProfileItem } from './ProfileItem';
import { PreviewNotification } from './PreviewNotification';
import { PreviewJoiningMethod } from './PreviewJoiningMethod';
import { PreviewInvitingMethod } from './PreviewInvitingMethod';
import { PreviewNameCard } from './PreviewNameCard';
import { PreviewMembers } from './PreviewMembers';
import { GroupAction } from './GroupAction';

interface IProfileDetailsProps {
  group?: IGroupModel;
  navigateToConversationList?: () => void;
}

export const ProfileDetails = (props: IProfileDetailsProps) => {
  const { group, navigateToConversationList } = props;
  const {
    type = '',
    groupID = '',
    notification = '',
    joinOption = '',
    inviteOption = '',
    memberCount = 0,
    selfInfo = {},
  } = group || {};
  const { nameCard = '', role = '' } = selfInfo;

  const getGroupTypeValue = () => {
    switch (type) {
      case TUIChatEngine.TYPES.GRP_WORK:
        return 'Work';
      case TUIChatEngine.TYPES.GRP_MEETING:
        return 'Metting';
      default:
        return type;
    }
  };

  return (
    <View style={styles.profileOverviewContainer}>
      <PreviewNotification
        groupID={groupID}
        type={type}
        notification={notification}
        role={role}
      />
      <ProfileItem
        name={TUITranslateService.t('ChatSetting.TYPE')}
        content={getGroupTypeValue()}
        isShowArrowNext={false}
      />
      <PreviewJoiningMethod
        groupID={groupID}
        type={type}
        joinOption={joinOption}
        role={role}
      />
      <PreviewInvitingMethod
        groupID={groupID}
        type={type}
        inviteOption={inviteOption}
        role={role}
      />
      <PreviewNameCard
        groupID={groupID}
        nameCard={nameCard}
      />
      <PreviewMembers
        groupID={groupID}
        memberCount={memberCount}
        role={role}
      />
      <GroupAction
        groupID={groupID}
        type={type}
        role={role}
        navigateToConversationList={navigateToConversationList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  profileOverviewContainer: {
    flexDirection: 'column',
    marginTop: 16,
  },
});
