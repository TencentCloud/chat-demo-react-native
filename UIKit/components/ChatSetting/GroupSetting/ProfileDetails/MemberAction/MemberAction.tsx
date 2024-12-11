import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import TUIChatEngine,
{
  TUIStore,
  StoreName,
  TUIGroupService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { canIDeleteMember, canISetAdmin } from '../../../utils';

interface IMemberActionProps {
  groupID: string;
  data: Record<string, any>;
  onClose: () => void;
}

export const MemberAction = (props: IMemberActionProps) => {
  const {
    groupID,
    data,
    onClose,
  } = props;

  const group = TUIStore.getData(StoreName.GRP, 'currentGroup');
  const { type = '', selfInfo = {} } = group;

  const getActionList = () => {
    const actionList: Record<string, any>[] = [];
    if (canISetAdmin(selfInfo.role, type)) {
      const text = data.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
        ? TUITranslateService.t('ChatSetting.CANCEL_ADMIN')
        : TUITranslateService.t('ChatSetting.SET_ADMIN');

      actionList.push({
        text,
        handler: () => setAdmin(data),
        additionalStyle: false,
      });
    }
    if (canIDeleteMember(selfInfo.role)) {
      actionList.push({
        text: TUITranslateService.t('ChatSetting.DELETE_MEMBER'),
        handler: () => deleteMember(data.userID),
        additionalStyle: true,
      });
    }
    return actionList;
  };

  const setAdmin = async (member: Record<string, any>) => {
    try {
      const { userID, role } = member;
      const newRole = role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
        ? TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER
        : TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN;

      await TUIGroupService.setGroupMemberRole({
        groupID,
        userID,
        role: newRole,
      });
    } catch (error) {} finally {
      onClose();
    }
  };

  const deleteMember = async (userID: string) => {
    try {
      await TUIGroupService.deleteGroupMember({
        groupID,
        userIDList: [userID],
      });
    } catch (error) {} finally {
      onClose();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={e => e.preventDefault()}>
      <View style={styles.actionContainerMask}>
        <View style={styles.actionContainer}>
          <View style={styles.actionBox}>
            {getActionList().map((item, index) => (
              <TouchableOpacity
                key={index}
                delayPressIn={0}
                activeOpacity={1}
                onPress={item.handler}
              >
                <View style={[
                  styles.actionItem,
                  item.additionalStyle && styles.hideBorder,
                ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      item.additionalStyle && styles.textColor,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            delayPressIn={0}
            activeOpacity={1}
            onPress={onClose}
          >
            <View style={styles.cancelContainer}>
              <Text style={styles.cancel}>{TUITranslateService.t('Common.CANCEL')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>

  );
};

const styles = StyleSheet.create({
  actionContainerMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00000066',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  actionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    paddingHorizontal: 22,
  },
  hideBorder: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 17,
    color: '#007AFF',
  },
  textColor: {
    color: '#FF584C',
  },
  cancelContainer: {
    marginTop: 12,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});
