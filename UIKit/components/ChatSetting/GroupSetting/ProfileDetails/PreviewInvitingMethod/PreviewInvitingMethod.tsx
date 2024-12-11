import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import TUIChatEngine, {
  TUIGroupService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../../../../Overlay';
import { RadioList } from '../../../../RadioList';
import { ProfileItem } from '../ProfileItem';

import { canIUpdateInviteOptions } from '../../../utils';

interface IPreviewInvitingMethodProps {
  groupID: string;
  type: string;
  inviteOption: string;
  role: string;
}

export const PreviewInvitingMethod = (props: IPreviewInvitingMethodProps) => {
  const {
    groupID,
    type,
    inviteOption: initialInviteOption,
    role,
  } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [inviteOption, setInviteOption] = useState<string>('');
  const [initialIndex, setInitialIndex] = useState<number>(-1);

  const INVITE_OPTIONS_MAP: Record<string, string> = {
    [TUIChatEngine.TYPES.INVITE_OPTIONS_DISABLE_INVITE]: TUITranslateService.t('ChatSetting.DISABLE_INVITE'),
    [TUIChatEngine.TYPES.INVITE_OPTIONS_NEED_PERMISSION]: TUITranslateService.t('ChatSetting.ADMIN_APPROVAL'),
    [TUIChatEngine.TYPES.INVITE_OPTIONS_FREE_ACCESS]: TUITranslateService.t('ChatSetting.AUTO_APPROVAL'),
  };

  const dataList = Object.keys(INVITE_OPTIONS_MAP).map((key: string) => {
    return {
      value: key,
      text: INVITE_OPTIONS_MAP[key],
    };
  });

  const getInitialIndex = () => {
    const index = dataList.findIndex((item) => {
      return item.value === initialInviteOption || item.value === inviteOption;
    });
    setInitialIndex(index);
  };

  const showOptionsList = () => {
    if (canIUpdateInviteOptions(role, type)) {
      getInitialIndex();
      setIsVisible(true);
    }
  };

  const updateInvitingMethod = async (data: Record<string, any>) => {
    setIsVisible(false);
    try {
      await TUIGroupService.updateGroupProfile({
        groupID,
        inviteOption: data.value,
      });
      setInviteOption(data.value);
    } catch (error) {}
  };

  return (
    <>
      <ProfileItem
        name={TUITranslateService.t('ChatSetting.INVITE_OPTIONS')}
        content={INVITE_OPTIONS_MAP[inviteOption] || INVITE_OPTIONS_MAP[initialInviteOption]}
        isShowArrowNext={canIUpdateInviteOptions(role, type)}
        onPress={showOptionsList}
      />
      <Overlay
        isVisible={isVisible}
        style={styles.overlay}
        onClose={() => { setIsVisible(false); }}
      >
        <SafeAreaView>
          <RadioList
            title={TUITranslateService.t('ChatSetting.INVITE_OPTIONS')}
            dataList={dataList}
            radioPos="right"
            initialIndex={initialIndex}
            onClose={() => { setIsVisible(false); }}
            onConfirm={updateInvitingMethod}
          />
        </SafeAreaView>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#FFFFFF',
  },
});
