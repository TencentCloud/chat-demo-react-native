import AudioRecorderPlayer, {
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';

export class AudioPlayer {
  private static player = new AudioRecorderPlayer();
  private static callback: () => void;
  static isPlaying = false;

  static addListener(callback: (e: PlayBackType) => void) {
    this.player.addPlayBackListener(callback);
  }

  static async play(
    url: string,
    callback: (e: PlayBackType) => void,
    interuptCalback: () => void
  ) {
    if (this.isPlaying) {
      this.callback();
      await this.stop();
    }
    this.callback = interuptCalback;
    this.isPlaying = true;
    this.player.addPlayBackListener(callback);
    const response = await this.player.startPlayer(url);
    return response;
  }

  static async stop() {
    this.isPlaying = false;
    await this.player.stopPlayer();
    this.player.removePlayBackListener();
  }

  static async startRecord(callback: (e: RecordBackType) => void) {
    const response = await this.player.startRecorder();
    this.player.addRecordBackListener(callback);
    return response;
  }

  static async stopRecord() {
    await this.player.stopRecorder();
    this.player.removeRecordBackListener();
  }
}
