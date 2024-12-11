import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { TUIGroupService, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../../../../Overlay';
import { ProfileEditor } from '../../../../ProfileEditor';
import { ProfileItem } from '../ProfileItem';

interface IPreviewNameCardProps {
  groupID: string;
  nameCard: string;
}

export const PreviewNameCard = (props: IPreviewNameCardProps) => {
  const { groupID, nameCard: initialNameCard } = props;
  const [nameCard, setNameCard] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const showEditor = () => {
    setIsVisible(true);
  };

  const updateMyNameCard = async (nameCard: string) => {
    setIsVisible(false);
    try {
      await TUIGroupService.setGroupMemberNameCard({ groupID, nameCard });
      setNameCard(nameCard);
    } catch (error) {}
  };

  return (
    <>
      <ProfileItem
        name={TUITranslateService.t('ChatSetting.NAMECARD')}
        content={nameCard || initialNameCard}
        isShowArrowNext={true}
        containerStyle={styles.nameCardContainer}
        onPress={showEditor}
      />
      <Overlay
        isVisible={isVisible}
        onClose={() => { setIsVisible(false); }}
      >
        <ProfileEditor
          title={TUITranslateService.t('ChatSetting.EDIT_NAMECARD')}
          value={nameCard || initialNameCard}
          onConfirm={updateMyNameCard}
        />
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  nameCardContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
});
