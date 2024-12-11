import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { TUIChatEngine, TUITranslateService } from '@tencentcloud/chat-uikit-engine';

import { Checkbox } from '../../UserSelector';
import { CreateGroupProcess } from '../ConversationCreate';

export enum GroupType {
  Work = TUIChatEngine.TYPES.GRP_WORK,
  Public = TUIChatEngine.TYPES.GRP_PUBLIC,
  Meeting = TUIChatEngine.TYPES.GRP_MEETING,
  AVChatRoom = TUIChatEngine.TYPES.GRP_AVCHATROOM,
  Community = TUIChatEngine.TYPES.GRP_COMMUNITY,
}

export interface IGroupTypeIntroductionProps {
  groupType: GroupType;
  setGroupType: React.Dispatch<React.SetStateAction<GroupType>>;
  setCreateGroupProcess: React.Dispatch<React.SetStateAction<CreateGroupProcess>>;
}

export const typeInfoList: Array<{ type: GroupType; name: string; des: string }>
= [
  {
    type: GroupType.Work,
    name: TUITranslateService.t('Conversation.WORK'),
    des: TUITranslateService.t('Conversation.WORK_DETAIL'),
  },
  {
    type: GroupType.Public,
    name: TUITranslateService.t('Conversation.PUBLIC'),
    des: TUITranslateService.t('Conversation.PUBLIC_DETAIL'),
  },
  {
    type: GroupType.Meeting,
    name: TUITranslateService.t('Conversation.MEETING'),
    des: TUITranslateService.t('Conversation.MEETING_DETAIL'),
  },
  {
    type: GroupType.AVChatRoom,
    name: TUITranslateService.t('Conversation.AVCHATROOM'),
    des: TUITranslateService.t('Conversation.AVCHATROOM_DETAIL'),
  },
  {
    type: GroupType.Community,
    name: TUITranslateService.t('Conversation.COMMUNITY'),
    des: TUITranslateService.t('Conversation.COMMUNITY_DETAIL'),
  },
];

export function GroupTypeIntroduction(props: IGroupTypeIntroductionProps) {
  const { groupType, setGroupType, setCreateGroupProcess } = props;

  const selectGroupType = (type: GroupType) => {
    setGroupType(type);
    setCreateGroupProcess(CreateGroupProcess.SetGroupOption);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {typeInfoList.map(({ type, name, des }) => (
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={1}
          key={type}
          style={[
            styles.groupTypeBox,
            groupType === type && styles.groupTypeBoxActive,
          ]}
          onPress={() => selectGroupType(type)}
        >
          <View style={styles.groupTypeTitleContainer}>
            <Checkbox
              isChecked={type === groupType}
              onChange={() => selectGroupType(type)}
            />
            <Text style={styles.groupTypeName}>{name}</Text>
          </View>
          <Text style={styles.groupTypeDescription}>{des}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={styles.groupTypeInfoDocument}
        onPress={() =>
          Linking.openURL(
            'https://trtc.io/document/50061?platform=web&product=chat&menulabel=uikit',
          )}
      >
        <Text style={styles.groupTypeInfoDocumentText}>
          {TUITranslateService.t('Conversation.PRODUCT_DOCUMENTATION')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 15,
    paddingTop: 16,
  },
  groupTypeBox: {
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'fff',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    marginBottom: 16,
  },
  groupTypeBoxActive: {
    borderColor: '#147aff',
  },
  groupTypeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTypeName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000CC',
    marginLeft: 8,
  },
  groupTypeDescription: {
    fontSize: 12,
    color: '#00000066',
    lineHeight: 17,
  },
  groupTypeInfoDocument: {
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  groupTypeInfoDocumentText: {
    fontSize: 16,
    color: '#0365F9',
    textDecorationLine: 'underline',
  },
});
