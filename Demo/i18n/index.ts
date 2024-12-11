import * as enUS from './en-US';
import * as zhCN from './zh-CN';

export interface ILanguageResources {
  [key: string]: string | ILanguageResources;
}

const resources: Record<string, ILanguageResources> = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

export default resources;
