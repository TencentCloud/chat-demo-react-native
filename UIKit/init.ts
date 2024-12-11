import TUICore, { TUILogin, TUIConstants } from '@tencentcloud/tui-core';
import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

export default class UIKitInit {
  static instance: UIKitInit | undefined;
  constructor() {
    TUICore.registerEvent(
      TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED,
      TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS,
      this,
    );
  }

  static getInstance() {
    if (!UIKitInit.instance) {
      UIKitInit.instance = new UIKitInit();
    }
    return UIKitInit.instance;
  }

  public onNotifyEvent(eventName: string, subKey: string) {
    const isLoginStateChanged = eventName === TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED;
    const isLoginSuccess = subKey === TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS;
    if (isLoginStateChanged && isLoginSuccess) {
      this.login();
    }
  }

  private login() {
    const { chat, SDKAppID, userID, userSig } = TUILogin.getContext();
    TUIChatEngine.login({
      chat,
      SDKAppID,
      userID,
      userSig,
    });
  }
}
