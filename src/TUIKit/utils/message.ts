import {
  MessageElemType,
  TencentImSDKPlugin,
  V2TimGroupChangeInfo,
  V2TimGroupMemberInfo,
  V2TimMessage,
} from 'react-native-tim-js';
import type { V2TimGroupTipsElem } from 'react-native-tim-js/lib/typescript/src/interface/v2TimGroupTipsElem';
import type { V2TimImage } from 'react-native-tim-js/lib/typescript/src/interface/v2TimImage';
import { DAY_SEC, SEC_SERIES } from '../constants';

export type MessageRepliedData = {
  messageReply: {
    messageAbstract: string;
    messageSender: string;
    messageID: string;
  };
};

const checkString = (text?: string) => {
  return text != null && text === '' ? undefined : text;
};

const getMemberNickName = (e: V2TimGroupMemberInfo) => {
  const friendRemark = e.friendRemark;
  const nameCard = e.nameCard;
  const nickName = e.nickName;
  const userID = e.userID;

  if (friendRemark != null && friendRemark !== '') {
    return friendRemark;
  } else if (nameCard != null && nameCard !== '') {
    return nameCard;
  } else if (nickName != null && nickName !== '') {
    return nickName;
  } else {
    return userID;
  }
};

export const MessageUtils = {
  getImageFromImageList: (list: V2TimImage[] | undefined, type: string) => {
    const getType = {
      Original: 0,
      Big: 1,
      Small: 2,
    }[type];
    try {
      return list?.filter((item) => item?.type === getType)[0];
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },

  formatVideoTime: (time: number) => {
    const times: number[] = [];
    if (time <= 0) return '0:01';
    if (time >= DAY_SEC) return '1d+';
    for (var idx = 0; idx < SEC_SERIES.length; idx++) {
      var sec: number = SEC_SERIES[idx]!;
      if (time >= sec) {
        Math.floor(times.push(time / sec));
        time = time % sec;
      } else if (idx > 0) {
        times.push(0);
      }
    }
    times.push(time);
    var formatTime = times[0]!.toString();
    for (var idx = 1; idx < times.length; idx++) {
      if (times[idx]! < 10) {
        formatTime += `:0${times[idx]?.toString()}`;
      } else {
        formatTime += `:${times[idx]?.toString()}`;
      }
    }
    return formatTime;
  },
  getDisplayName: (message: V2TimMessage) => {
    const friendRemark = message.friendRemark ?? '';
    const nameCard = message.nameCard ?? '';
    const nickName = message.nickName ?? '';
    const sender = message.sender ?? '';
    const displayName =
      friendRemark !== ''
        ? friendRemark
        : nameCard !== ''
        ? nameCard
        : nickName !== ''
        ? nickName
        : sender;
    return displayName.toString();
  },
  getAbstractMessageAsync: (message: V2TimMessage) => {
    const msgType = message.elemType;
    switch (msgType) {
      case MessageElemType.V2TIM_ELEM_TYPE_CUSTOM:
        return '[消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_SOUND:
        return '[语音]';
      case MessageElemType.V2TIM_ELEM_TYPE_TEXT:
        return message.textElem!.text;
      case MessageElemType.V2TIM_ELEM_TYPE_FACE:
        return '[表情]';
      case MessageElemType.V2TIM_ELEM_TYPE_FILE:
        const fileName = message.fileElem!.fileName ?? '';
        return `[文件] ${fileName}`;
      case MessageElemType.V2TIM_ELEM_TYPE_GROUP_TIPS:
        return '群提示';
      case MessageElemType.V2TIM_ELEM_TYPE_IMAGE:
        return '[图片]';
      case MessageElemType.V2TIM_ELEM_TYPE_VIDEO:
        return '[视频]';
      case MessageElemType.V2TIM_ELEM_TYPE_LOCATION:
        return '[位置]';
      case MessageElemType.V2TIM_ELEM_TYPE_MERGER:
        return '[聊天记录]';
      default:
        return '未知消息';
    }
  },
  isReplyMessage: (message: V2TimMessage) => {
    const hasCustomData =
      message.cloudCustomData && message.cloudCustomData !== '';
    if (hasCustomData) {
      try {
        const messageCloudCustomData = JSON.parse(message.cloudCustomData!);
        if (messageCloudCustomData.messageReply != null) {
          return (
            Object.keys(messageCloudCustomData.messageReply).includes(
              'messageAbstract'
            ) &&
            Object.keys(messageCloudCustomData.messageReply).includes(
              'messageSender'
            ) &&
            Object.keys(messageCloudCustomData.messageReply).includes(
              'messageID'
            )
          );
        }
        return false;
      } catch (error) {
        return false;
      }
    }
    return false;
  },
  isMessageRevokable: (messageTime: number, uperTimeLimit: number) => {
    return Math.ceil(new Date().getTime() / 1000) - messageTime < uperTimeLimit;
  },

  groupTipsMessageAbstract: async (groupTipsElem: V2TimGroupTipsElem) => {
    let displayMessage = '';
    const operationType = groupTipsElem.type;
    const operationMember = groupTipsElem.opMember;
    const memberList = groupTipsElem.memberList;
    const opUserNickName = MessageUtils.getOpUserNick(operationMember);

    switch (operationType) {
      case 7:
        const option7 = opUserNickName ?? '';
        const groupChangeInfoList = groupTipsElem.groupChangeInfoList ?? [];
        const promiseList = groupChangeInfoList.map(async (element) => {
          const newText = await getGroupChangeType(element);
          return newText;
        });
        const promiseResponse = await Promise.all(promiseList);
        let changedInfoString = '';
        if (promiseResponse.join('/') === '') {
          changedInfoString = '群资料';
        } else {
          changedInfoString = promiseResponse.join('/');
        }
        displayMessage = `${option7}修改${changedInfoString}`;
        break;
      case 3:
        const option6 = opUserNickName ?? '';
        displayMessage = `${option6}退出群聊`;
        break;
      case 2:
        const option5 = memberList!
          .map((e) => getMemberNickName(e!)?.toString())
          .join('、');
        const inviteUser = MessageUtils.getOpUserNick(operationMember);
        displayMessage = `${inviteUser}邀请${option5}加入群组`;
        break;
      case 4:
        const option4 = memberList!
          .map((e) => getMemberNickName(e!)?.toString())
          .join('、');
        const kickUser = MessageUtils.getOpUserNick(operationMember);
        displayMessage = `${kickUser}将${option4}提出群组`;
        break;
      case 1:
        const option3 = memberList!
          .map((e) => getMemberNickName(e!)?.toString())
          .join('、');
        displayMessage = `用户${option3}加入了群聊`;
        break;
      case 8:
        displayMessage = groupTipsElem
          .memberList!.map((e) => {
            const changedMember = groupTipsElem.memberChangeInfoList!.find(
              (element) => element!.userID == e!.userID
            );
            const isMute = changedMember!.muteTime != 0;
            const option2 = getMemberNickName(e!);
            const displayMessage = isMute ? '禁言' : '解除禁言';
            return `${option2} 被${displayMessage}`;
          })
          .join('、');
        break;
      case 5:
        const adminMember2 = memberList!
          .map((e) => getMemberNickName(e!)?.toString())
          .join('、');
        const opMember2 = MessageUtils.getOpUserNick(operationMember);
        const option34 = adminMember2;
        displayMessage = `${opMember2}将 ${option34} 设置为管理员`;
        break;
      case 6:
        const adminMember = memberList!
          .map((e) => getMemberNickName(e!)?.toString())
          .join('、');
        const opMember = MessageUtils.getOpUserNick(operationMember);
        const option1 = adminMember;
        displayMessage = `${opMember}将 ${option1} 取消管理员`;
        break;
      default:
        const option2 = operationType.toString();
        displayMessage = `系统消息 ${option2}`;
        break;
    }
    return displayMessage;
  },
  getOpUserNick: (opUser: V2TimGroupMemberInfo) => {
    const haveFriendRemark =
      opUser?.friendRemark && opUser?.friendRemark !== '';
    const haveNickName = opUser?.nickName && opUser?.nickName !== '';
    const haveUserID = opUser?.userID && opUser?.userID !== '';
    return haveFriendRemark
      ? opUser?.friendRemark
      : haveNickName
      ? opUser?.nickName
      : haveUserID
      ? opUser.userID
      : '';
  },
};

const getGroupChangeType = async (info: V2TimGroupChangeInfo) => {
  const type = info.type;
  let value = info.value;
  let s = '群资料信息';
  switch (type) {
    case 6:
      s = '自定义字段';
      break;
    case 4:
      s = '群头像';
      break;
    case 2:
      s = '群简介';
      break;
    case 1:
      s = '群名称';
      break;
    case 3:
      s = '群公告';
      break;
    case 5:
      s = '群主';
      const { code, data } = await TencentImSDKPlugin.v2TIMManager.getUsersInfo(
        [value ?? '']
      );
      if (code == 0 && data) {
        const userInfo = data[0];
        if (userInfo) {
          value =
            checkString(userInfo.nickName) ?? checkString(userInfo.userID);
        }
      }
      break;
    case 8:
      s = '全员禁言状态';
      break;
    case 10:
      s = '消息接收方式';
      break;
    case 11:
      s = '加群方式';
      break;
  }

  const option8 = s;
  if (value && value !== '') {
    return `${s}为 ${value}`;
  } else {
    return option8;
  }
};
