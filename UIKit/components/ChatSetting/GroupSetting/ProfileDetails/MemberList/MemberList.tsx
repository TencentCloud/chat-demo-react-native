import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import TUIChatEngine, {
  StoreName,
  TUIGroupService,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { RadioList } from '../../../../RadioList';
import { Overlay } from '../../../../Overlay';

import { PreviewList } from './PreviewList';

import { USER_AVATAR_DEFAULT } from '../../../../../constant';
import { canISetAdmin, canIDeleteMember } from '../../../utils';

interface IMemberListProps {
  memberListVisible: boolean;
  title: string;
  groupID: string;
  filterMySelf?: boolean;
  radioPos?: string;
  onPress?: (data: Record<string, any>) => void;
  onClose: () => void;
  onConfirm?: (data: Record<string, string | number>) => void;
  children?: React.ReactNode; // use children to add view replace Overlay on the top of Overlay
}

export const MemberList = (props: IMemberListProps) => {
  const {
    memberListVisible,
    title,
    groupID,
    filterMySelf,
    radioPos,
    onPress,
    onClose,
    onConfirm,
    children,
  } = props;

  const [memberList, setMemberList] = useState<any>([]);

  const myUserID = TUIChatEngine.getMyUserID();
  const group = TUIStore.getData(StoreName.GRP, 'currentGroup');
  const { type = '', selfInfo = {} } = group;

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
    setMemberList(_memberList);
  };

  const _onConfirm = (data: Record<string, any>) => {
    onConfirm && onConfirm(data);
  };

  const handelDataList = () => {
    let dataList = memberList;

    // filter myself
    if (filterMySelf) {
      dataList = memberList.filter((item: Record<string, any>) => item.userID !== myUserID);
    }

    // get radioList data
    dataList = dataList.map((item: Record<string, any>) => {
      let mark = null;
      if (item.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
        mark = TUITranslateService.t('ChatSetting.OWNER');
      }
      if (item.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
        mark = TUITranslateService.t('ChatSetting.ADMIN');
      }

      const arrowNext = onPress && (
        (item.userID !== myUserID)
        && (canISetAdmin(selfInfo?.role, type) || canIDeleteMember(selfInfo?.role))
        && item.role !== TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
      );

      return {
        userID: item.userID,
        icon: item.avatar || USER_AVATAR_DEFAULT,
        text: item.nick || item.userID,
        role: item.role,
        mark,
        arrowNext,
      };
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

  return (
    <Overlay
      isVisible={memberListVisible}
      onClose={onClose}
      style={styles.overlayStyle}
    >
      <SafeAreaView>
        {radioPos && (
          <RadioList
            title={title}
            dataList={handelDataList()}
            radioPos={radioPos}
            onClose={onClose}
            onConfirm={_onConfirm}
            loadMoreData={loadMoreData}
            textStyle={styles.textStyle}
          />
        )}
        {!radioPos && (
          <PreviewList
            title={title}
            dataList={handelDataList()}
            onPress={onPress}
            onClose={onClose}
            loadMoreData={loadMoreData}
            textStyle={styles.textStyle}
          />
        )}
      </SafeAreaView>
      {children}
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayStyle: {
    backgroundColor: '#FFFFFF',
  },
  textStyle: {
    width: 100,
  },
});
