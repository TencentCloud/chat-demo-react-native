import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { TUIGroupService, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Overlay } from '../../../../Overlay';
import { ProfileEditor } from '../../../../ProfileEditor';
import { PreviewInfo } from '../PreviewInfo';

import { canIUpdateBasicProfile } from '../../../utils';

interface IPreviewNotificationProps {
  groupID: string;
  type: string;
  notification: string;
  role: string;
}

export const PreviewNotification = (props: IPreviewNotificationProps) => {
  const {
    groupID,
    type,
    notification,
    role,
  } = props;

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [previewNotification, setPreviewNotification] = useState<boolean>(false);

  const handleNotification = () => {
    if (canIUpdateBasicProfile(role, type)) {
      setPreviewNotification(false);
    } else {
      setPreviewNotification(true);
    }
    setIsVisible(true);
  };

  const updateNotification = async (notification: string) => {
    setIsVisible(false);
    try {
      await TUIGroupService.updateGroupProfile({ groupID, notification });
    } catch (error) {}
  };

  return (
    <>
      <View style={styles.notificationItem}>
        <Text style={styles.itemName}>{TUITranslateService.t('ChatSetting.GROUP_NOTICE')}</Text>
        <TouchableOpacity
          style={styles.notificationContent}
          delayPressIn={0}
          activeOpacity={1}
          onPress={handleNotification}
        >
          <Text
            style={styles.notificationText}
            numberOfLines={1}
          >
            {notification || TUITranslateService.t('ChatSetting.NO_NOTICE')}
          </Text>
          <Image
            style={styles.arrowNextIcon}
            source={require('../../../../../assets/arrow-next.png')}
          />
        </TouchableOpacity>
      </View>
      <Overlay
        isVisible={isVisible}
        onClose={() => { setIsVisible(false); }}
      >
        {previewNotification && (
          <PreviewInfo
            title={TUITranslateService.t('ChatSetting.GROUP_NOTICE')}
            value={notification || TUITranslateService.t('ChatSetting.NO_NOTICE')}
          />
        )}
        {!previewNotification && (
          <ProfileEditor
            title={TUITranslateService.t('ChatSetting.EDIT_GROUP_NOTICE')}
            value={notification}
            onConfirm={updateNotification}
          />
        )}
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    minHeight: 55,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9F0',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 2,
  },
  itemName: {
    width: 160,
    fontSize: 16,
    color: '#000000',
  },
  notificationContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 8,
  },
  notificationText: {
    width: 280,
    fontSize: 14,
    color: '#666666',
  },
  arrowNextIcon: {
    width: 7,
    height: 12,
  },
});
