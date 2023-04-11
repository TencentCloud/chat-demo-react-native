import type {Dispatch} from 'react';
import {
  MessageElemType,
  MessagePriorityEnum,
  TencentImSDKPlugin,
  V2TimMessage,
  V2TimMsgCreateInfoResult,
  V2TimUserFullInfo,
} from 'react-native-tim-js';
import {
  TUIChatAction,
  addMessageItem,
  updateMessateItem,
  setRepliedMessage,
} from '../../store';

export class MessageService {
  private dispatch: React.Dispatch<TUIChatAction> | null = null;
  private messageManager = TencentImSDKPlugin.v2TIMManager.getMessageManager();
  private loginUserInfo: V2TimUserFullInfo | undefined = undefined;
  private convID: string = '';
  private convType: number = 0;

  constructor(
    dipatch: Dispatch<TUIChatAction>,
    {
      userInfo,
      convID,
      convType,
    }: {
      userInfo?: V2TimUserFullInfo;
      convID: string;
      convType: number;
    },
  ) {
    this.dispatch = dipatch;
    this.loginUserInfo = userInfo;
    this.convID = convID;
    this.convType = convType;
  }

  private setUserInfoForMessage(
    messageInfo: V2TimMessage,
    id?: string,
  ): V2TimMessage {
    if (this.loginUserInfo != null) {
      messageInfo.faceUrl = this.loginUserInfo.faceUrl;
      messageInfo.nickName = this.loginUserInfo.nickName;
      messageInfo.sender = this.loginUserInfo.userID;
    }
    messageInfo.timestamp = Math.ceil(new Date().getTime() / 1000);
    messageInfo.isSelf = true;
    messageInfo.status = 1;
    messageInfo.id = id;

    return messageInfo;
  }

  async sendTextMessage(text: string) {
    const {code, data} = await this.messageManager.createTextMessage(text);
    if (code === 0) {
      this.sendMessage(data);
    }
  }

  private _getAbstractMessage(message: V2TimMessage) {
    const elemType = message.elemType;
    switch (elemType) {
      case MessageElemType.V2TIM_ELEM_TYPE_FACE:
        return '[表情消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_CUSTOM:
        return '[自定义消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_FILE:
        return '[文件消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_GROUP_TIPS:
        return '[群消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_IMAGE:
        return '[图片消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_LOCATION:
        return '[位置消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_MERGER:
        return '[合并消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_NONE:
        return '[没有元素]';
      case MessageElemType.V2TIM_ELEM_TYPE_SOUND:
        return '[语音消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_TEXT:
        return '[文本消息]';
      case MessageElemType.V2TIM_ELEM_TYPE_VIDEO:
        return '[视频消息]';
      default:
        return '';
    }
  }

  async sendRepliedMessage(text: string, repliedMessage: V2TimMessage) {
    const {code, data} = await this.messageManager.createTextMessage(text);
    if (code === 0) {
      const hasNickName =
        repliedMessage?.nickName && repliedMessage?.nickName !== '';
      data!.messageInfo!.cloudCustomData! = JSON.stringify({
        messageReply: {
          messageID: repliedMessage!.msgID,
          messageAbstract: this._getAbstractMessage(repliedMessage!),
          messageSender: hasNickName
            ? repliedMessage!.nickName
            : repliedMessage?.sender,
          messageType: repliedMessage?.elemType,
          version: 1,
        },
      });
      this.sendMessage(data, undefined, undefined, repliedMessage);
    }
  }

  private async sendMessage(
    createdMessageData: V2TimMsgCreateInfoResult | undefined,
    width?: number,
    height?: number,
    repliedMessage?: V2TimMessage,
  ) {
    const isUIKit = TencentImSDKPlugin.v2TIMManager.getUIKitIdentification();
    if (!isUIKit) {
      throw new Error('Pleade pass isUIkit field at initialization!');
    }
    const messageInfo = createdMessageData?.messageInfo;
    if (messageInfo) {
      const createdMsgID = createdMessageData.id;
      const messageInfoWithSender = this.setUserInfoForMessage(
        messageInfo,
        createdMsgID,
      );
      if (width && height) {
        const originalImageElem = messageInfoWithSender.imageElem;
        messageInfoWithSender.imageElem = {
          ...originalImageElem,
          imageList: [
            {
              localUrl: originalImageElem?.path,
              type: 0,
              width: width,
              height: height,
            },
          ],
        };
      }
      this.dispatch!(addMessageItem(messageInfoWithSender));

      const receiver = this.convType === 1 ? this.convID : '';
      const groupID = this.convType === 2 ? this.convID : '';
      if (repliedMessage) {
        const {code, data} = await this.messageManager.sendReplyMessage({
          id: createdMsgID!,
          receiver,
          groupID,
          replyMessage: repliedMessage,
          priority: MessagePriorityEnum.V2TIM_PRIORITY_NORMAL,
        });
        if (code === 0 && data) {
          this.dispatch!(setRepliedMessage({}));
          this.dispatch!(updateMessateItem(data));
        } else {
          messageInfoWithSender.status = 3;
          this.dispatch!(updateMessateItem(messageInfoWithSender));
        }
      } else {
        const {code, data} = await this.messageManager.sendMessage({
          id: createdMsgID!,
          receiver,
          groupID,
        });
        console.log('send message response');
        if (code === 0 && data) {
          this.dispatch!(updateMessateItem(data));
        } else {
          messageInfoWithSender.status = 3;
          this.dispatch!(updateMessateItem(messageInfoWithSender));
        }
      }
    }
  }

  async sendImageMessage(path: string, width: number, height: number) {
    const {code, data} = await this.messageManager.createImageMessage(path);
    if (code === 0) {
      this.sendMessage(data, width, height);
    }
  }

  async sendVideoMessage(
    path: string,
    duration: number,
    snapshotPath: string,
    type: string,
    snapshotWidth: number,
    snapshotHeight: number,
  ) {
    const {code, data} = await this.messageManager.createVideoMessage(
      path,
      type,
      duration,
      snapshotPath,
    );
    if (data && code === 0) {
      data!.messageInfo.videoElem!.snapshotWidth = snapshotWidth;
      data!.messageInfo.videoElem!.snapshotHeight = snapshotHeight;
      this.sendMessage(data);
    }
  }

  async sendFileMessage(filePath: string, fileName: string) {
    const {code, data} = await this.messageManager.createFileMessage(
      filePath,
      fileName,
    );
    if (code === 0) {
      this.sendMessage(data);
    }
  }

  async sendSoundMessage(soundPath: string, soundSeconds: number) {
    const {code, data} = await this.messageManager.createSoundMessage(
      soundPath,
      soundSeconds,
    );
    if (code === 0) {
      this.sendMessage(data);
    }
  }
}
