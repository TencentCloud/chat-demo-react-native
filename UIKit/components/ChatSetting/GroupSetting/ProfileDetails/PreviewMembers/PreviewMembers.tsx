import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import TUIChatEngine,
{ StoreName,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { ProfileItem, IProfileItemProps } from '../ProfileItem';
import { MemberList } from '../MemberList';
import { MemberAction } from '../MemberAction';

import { USER_AVATAR_DEFAULT } from '../../../../../constant';

interface IPreviewMembersProps {
  groupID: string;
  role: string;
  memberCount: number;
}

export const PreviewMembers = (props: IPreviewMembersProps) => {
  const { groupID, role, memberCount } = props;

  const [memberListVisible, setMemberListVisible] = useState<boolean>(false);
  const [memberActionPanelVisible, setMemberActionPanelVisible] = useState<boolean>(false);
  const [memberList, setMemberList] = useState<any>([]);
  const [memberData, setMemberData] = useState<Record<string, any>>({});
  const [myProfile, setMyProfile] = useState<Record<string, any>>({});

  useEffect(() => {
    const profile = TUIStore.getData(StoreName.USER, 'userProfile');
    setMyProfile(profile);

    TUIStore.watch(StoreName.GRP, {
      currentGroupMemberList: onCurrentGroupMemberListUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.GRP, {
        currentGroupMemberList: onCurrentGroupMemberListUpdated,
      });
    };
  }, []);

  const onCurrentGroupMemberListUpdated = (memberList: Record<string, string | number>) => {
    setMemberList(memberList);
  };

  const showMoreMemberList = () => {
    setMemberListVisible(true);
  };

  const getRoleText = (role: string) => {
    if (role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
      return TUITranslateService.t('ChatSetting.OWNER');
    }
    if (role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
      return TUITranslateService.t('ChatSetting.ADMIN');
    }
    return TUITranslateService.t('ChatSetting.MEMBER');
  };

  const getMemberItemList = () => {
    const memberItemList: IProfileItemProps[] = [
      {
        name: `${TUITranslateService.t('ChatSetting.GROUP_MEMBERS')}(${memberCount})`,
        isShowArrowNext: true,
        onPress: showMoreMemberList,
      },
      {
        icon: myProfile?.avatar || USER_AVATAR_DEFAULT,
        name: TUITranslateService.t('ChatSetting.YOU'),
        content: getRoleText(role),
        isShowArrowNext: false,
        contentStyle: styles.contentStyleForMember,
      },
    ];
    for (let i = 0; i < memberList.length; i++) {
      const member = memberList[i];
      if (member.userID !== myProfile?.userID) {
        memberItemList.push(
          {
            icon: member.avatar || USER_AVATAR_DEFAULT,
            name: member.nick || member.userID,
            isShowArrowNext: false,
            containerStyle: styles.overviewItemForMember,
          }
        );
      }
      if (memberItemList.length > 3) {
        break;
      }
    }
    return memberItemList;
  };

  const onPressMemberItem = (item: Record<string, any>) => {
    setMemberData(item);
    setMemberActionPanelVisible(true);
  };

  return (
    <>
      {getMemberItemList().map((item, index) => {
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
        title={`${TUITranslateService.t('ChatSetting.GROUP_MEMBERS')}(${memberCount})`}
        groupID={groupID}
        onPress={onPressMemberItem}
        onClose={() => setMemberListVisible(false)}
      >
        {memberActionPanelVisible && (
          <MemberAction
            groupID={groupID}
            data={memberData}
            onClose={() => setMemberActionPanelVisible(false)}
          />
        )}
      </MemberList>
    </>
  );
};

const styles = StyleSheet.create({
  overviewItemForMember: {
    justifyContent: 'flex-start',
  },
  contentStyleForMember: {
    color: '#666666',
  },
});
