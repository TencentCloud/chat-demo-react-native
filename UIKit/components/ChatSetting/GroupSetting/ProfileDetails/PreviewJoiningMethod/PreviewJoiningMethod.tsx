import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import TUIChatEngine, {
  TUIGroupService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../../../../Overlay';
import { RadioList } from '../../../../RadioList';
import { ProfileItem } from '../ProfileItem';

import { canIUpdateJoinOptions } from '../../../utils';

interface IPreviewJoiningMethodProps {
  groupID: string;
  type: string;
  joinOption: string;
  role: string;
}

export const PreviewJoiningMethod = (props: IPreviewJoiningMethodProps) => {
  const {
    groupID,
    type,
    joinOption: initialJoinOption,
    role,
  } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [joinOption, setJoinOption] = useState<string>('');
  const [initialIndex, setInitialIndex] = useState<number>(-1);

  const JOIN_OPTIONS_MAP: Record<string, string> = {
    [TUIChatEngine.TYPES.JOIN_OPTIONS_DISABLE_APPLY]: TUITranslateService.t('ChatSetting.DISABLE_JOIN'),
    [TUIChatEngine.TYPES.JOIN_OPTIONS_NEED_PERMISSION]: TUITranslateService.t('ChatSetting.ADMIN_APPROVAL'),
    [TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS]: TUITranslateService.t('ChatSetting.AUTO_APPROVAL'),
  };

  const dataList = Object.keys(JOIN_OPTIONS_MAP).map((key: string) => {
    return {
      value: key,
      text: JOIN_OPTIONS_MAP[key],
    };
  });

  const getInitialIndex = () => {
    const index = dataList.findIndex((item) => {
      return item.value === initialJoinOption || item.value === joinOption;
    });
    setInitialIndex(index);
  };

  const showOptionsList = () => {
    if (canIUpdateJoinOptions(role, type)) {
      getInitialIndex();
      setIsVisible(true);
    }
  };

  const updateJoingMethod = async (data: Record<string, any>) => {
    setIsVisible(false);
    try {
      await TUIGroupService.updateGroupProfile({
        groupID,
        joinOption: data.value,
      });
      setJoinOption(data.value);
    } catch (error) {}
  };

  return (
    <>
      <ProfileItem
        name={TUITranslateService.t('ChatSetting.JOIN_OPTIONS')}
        content={JOIN_OPTIONS_MAP[joinOption] || JOIN_OPTIONS_MAP[initialJoinOption]}
        isShowArrowNext={canIUpdateJoinOptions(role, type)}
        onPress={showOptionsList}
      />
      <Overlay
        isVisible={isVisible}
        style={styles.overlay}
        onClose={() => { setIsVisible(false); }}
      >
        <SafeAreaView>
          <RadioList
            title={TUITranslateService.t('ChatSetting.JOIN_OPTIONS')}
            dataList={dataList}
            radioPos="right"
            initialIndex={initialIndex}
            onClose={() => { setIsVisible(false); }}
            onConfirm={updateJoingMethod}
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
