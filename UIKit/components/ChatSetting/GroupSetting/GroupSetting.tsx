import React, { useEffect, useState } from 'react';

import { IGroupModel, StoreName, TUIStore } from '@tencentcloud/chat-uikit-engine';

import { BasicProfile } from './BasicProfile';
import { ProfileDetails } from './ProfileDetails';

interface IGroupSettingProps {
  navigateToChat?: () => void;
  navigateToConversationList?: () => void;
}

export const GroupSetting = (props: IGroupSettingProps) => {
  const { navigateToChat, navigateToConversationList } = props;
  const [group, setGroup] = useState<IGroupModel>();

  useEffect(() => {
    TUIStore.watch(StoreName.GRP, {
      currentGroup: onCurrentGroupUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.GRP, {
        currentGroup: onCurrentGroupUpdated,
      });
    };
  });

  const onCurrentGroupUpdated = (group: IGroupModel) => {
    setGroup(group);
  };

  return (
    <>
      <BasicProfile
        group={group}
        navigateToChat={navigateToChat}
      />
      <ProfileDetails
        group={group}
        navigateToConversationList={navigateToConversationList}
      />
    </>
  );
};
