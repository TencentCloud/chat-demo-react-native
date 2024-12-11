import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

export enum LanguageType {
  zhCN = 'zh-CN',
  enUS = 'en-US',
}

export class LanguageServer {
  static instance: LanguageServer;
  language: LanguageType;
  listeners: Array<(language: LanguageType) => void>;
  constructor() {
    this.language = LanguageType.enUS;
    this.listeners = [];
  }

  static getInstance() {
    if (!LanguageServer.instance) {
      LanguageServer.instance = new LanguageServer();
    }
    return LanguageServer.instance;
  }

  setLanguage(language: LanguageType) {
    this.language = language;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    TUITranslateService.useI18n(language);
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](language);
    }
  }

  getLanguage() {
    return this.language;
  }

  on(callback: (language: LanguageType) => void) {
    this.listeners.push(callback);
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](this.language);
    }
  }

  off(callback: (language: LanguageType) => void) {
    this.listeners = this.listeners.filter(item => item !== callback);
  }
}
