import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  IConversationModel,
  IGroupModel,
  StoreName,
  TUIGroupService,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

import { Avatar } from '../../../Avatar';
import { Switch } from '../../../Switch';
import { Overlay } from '../../../Overlay';
import { ProfileEditor } from '../../../ProfileEditor';

import { GROUP_AVATAR_DEFAULT } from '../../../../constant';

import { canIUpdateBasicProfile } from '../../utils';

interface IBasicProfileProps {
  group?: IGroupModel;
  navigateToChat?: () => void;
}

export const BasicProfile = (props: IBasicProfileProps) => {
  const { group, navigateToChat } = props;
  const { name = '', groupID = '', avatar, type = '', selfInfo = {} } = group || {};
  const { role = '' } = selfInfo;

  const [conversationModel, setConversationModel] = useState<IConversationModel>();
  const [enableMuteConversation, setEnableMuteConversation] = useState<boolean>(false);
  const [enablePinConversation, setEnablePinConversation] = useState<boolean>(false);
  const [isVisibleProfileEditor, setIsVisibleProfileEditor] = useState<boolean>(false);

  useEffect(() => {
    TUIStore.watch(StoreName.CONV, {
      currentConversation: onCurrentConversationUpdated,
    });
    return () => {
      TUIStore.unwatch(StoreName.CONV, {
        currentConversation: onCurrentConversationUpdated,
      });
    };
  });

  const onCurrentConversationUpdated = (conversation: IConversationModel) => {
    const { isMuted = false, isPinned = false } = conversation;
    if (conversationModel?.isMuted !== isMuted) {
      setEnableMuteConversation(isMuted);
    }
    if (conversationModel?.isPinned !== isPinned) {
      setEnablePinConversation(isPinned);
    }
    setConversationModel(conversation);
  };

  const _navigateToChat = () => {
    navigateToChat && navigateToChat();
  };

  const showEditor = () => {
    if (canIUpdateBasicProfile(role, type)) {
      setIsVisibleProfileEditor(true);
    }
  };

  const updateGroupName = (name: string) => {
    setIsVisibleProfileEditor(false);
    try {
      TUIGroupService.updateGroupProfile({ groupID, name });
    } catch (error) {}
  };

  const switchMuteConversation = () => {
    setEnableMuteConversation(!enableMuteConversation);
    conversationModel?.muteConversation();
  };

  const switchPinConversation = () => {
    setEnablePinConversation(!enablePinConversation);
    conversationModel?.pinConversation();
  };

  return (
    <View style={styles.basicProfileContainer}>
      <View style={styles.basicProfile}>
        <Avatar
          styles={styles.groupAvatar}
          uri={avatar || GROUP_AVATAR_DEFAULT}
          size={94}
          radius={46}
        />
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          style={styles.groupNameBox}
          onPress={showEditor}
        >
          <Text
            style={styles.groupName}
            numberOfLines={1}
          >
            {name}
          </Text>
          {canIUpdateBasicProfile(role, type) && (
            <Image
              style={styles.editIcon}
              source={require('../../../../assets/edit-icon.png')}
            />
          )}
        </TouchableOpacity>
        <Text
          style={styles.groupID}
          numberOfLines={1}
        >
          {`ID: ${groupID}`}
        </Text>
      </View>
      <View style={styles.chatQuickActionContainer}>
        <TouchableOpacity
          style={styles.actionItem}
          delayPressIn={0}
          activeOpacity={1}
          onPress={_navigateToChat}
        >
          <Image
            style={styles.actionIcon}
            source={require('../../../../assets/msg-icon.png')}
          />
          <Text style={styles.actionName}>{TUITranslateService.t('ChatSetting.SEND_MESSAGE')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.conversationQuickAction}>
        <View style={[styles.quickActionItem, styles.muteConversation]}>
          <Text style={styles.quickActionText}>{TUITranslateService.t('ChatSetting.MUTE_NOTIFICATIONS')}</Text>
          <Switch
            value={enableMuteConversation}
            onChange={switchMuteConversation}
          />
        </View>
        <View style={styles.quickActionItem}>
          <Text style={styles.quickActionText}>{TUITranslateService.t('ChatSetting.PIN_CHAT')}</Text>
          <Switch
            value={enablePinConversation}
            onChange={switchPinConversation}
          />
        </View>
      </View>
      <Overlay
        isVisible={isVisibleProfileEditor}
        onClose={() => { setIsVisibleProfileEditor(false); }}
      >
        <ProfileEditor
          title={TUITranslateService.t('ChatSetting.EDIT_GROUP_NAME')}
          value={name}
          onConfirm={updateGroupName}
        />
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  basicProfileContainer: {
    flexDirection: 'column',
  },
  basicProfile: {
    paddingHorizontal: 33,
  },
  groupAvatar: {
    alignSelf: 'center',
    marginTop: 42,
    marginBottom: 12,
  },
  groupNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 24,
  },
  groupName: {
    maxWidth: 160,
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
  },
  editIcon: {
    width: 15,
    height: 15,
    marginLeft: 12,
  },
  groupID: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  chatQuickActionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  actionItem: {
    width: 92,
    height: 95,
    borderRadius: 12,
    backgroundColor: '#F9F9F9F0',
    alignItems: 'center',
    justifyContent: 'center',

  },
  actionIcon: {
    width: 36,
    height: 36,
    marginBottom: 8,
  },
  actionName: {
    fontSize: 16,
    color: '#000000',
  },
  conversationQuickAction: {
    marginTop: 15,
  },
  quickActionItem: {
    height: 55,
    backgroundColor: '#F9F9F9F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  muteConversation: {
    marginBottom: 2,
  },
  quickActionText: {
    fontSize: 16,
    color: '#000000',
  },
});
