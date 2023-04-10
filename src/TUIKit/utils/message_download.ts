import { TencentImSDKPlugin } from 'react-native-tim-js';

export class MessageDownload {
  static downloadTask: string[] = [];
  static isDownloading: boolean = false;
  static avoidUpdateTask: string[] = [];

  static addTask(messageID: string) {
    this.downloadTask.push(messageID);
    if (!this.isDownloading) {
      this.doTask();
    }
  }

  static doTask() {
    const msgID = this.downloadTask.shift();
    if (msgID) {
      this.isDownloading = true;
      TencentImSDKPlugin.v2TIMManager
        .getMessageManager()
        .downloadMessage(msgID, 6, 0, false);
    } else {
      this.isDownloading = false;
    }
  }
}
