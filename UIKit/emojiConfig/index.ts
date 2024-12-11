import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import {
  DEFAULT_BASIC_EMOJI_URL,
  DEFAULT_BIG_EMOJI_URL,
  BIG_EMOJI_GROUP_LIST,
  DEFAULT_BASIC_EMOJI_URL_MAPPING,
  BASIC_EMOJI_NAME_TO_KEY_MAPPING,
  IEmojiGroupList,
  EMOJI_TYPE,
} from './defaultEmoji';

const BASIC_EMOJI_URL = DEFAULT_BASIC_EMOJI_URL;

const BASIC_EMOJI_URL_MAPPING = DEFAULT_BASIC_EMOJI_URL_MAPPING;

const EMOJI_GROUP_LIST: IEmojiGroupList = [
  {
    emojiGroupID: 0,
    type: EMOJI_TYPE.BASIC,
    url: BASIC_EMOJI_URL,
    list: Object.keys(BASIC_EMOJI_URL_MAPPING),
  },
  ...BIG_EMOJI_GROUP_LIST,
];

const TAB_ICON_LIST = EMOJI_GROUP_LIST.map((item) => {
  if (item.type === EMOJI_TYPE.BASIC) {
    return item.url + BASIC_EMOJI_URL_MAPPING[item.list[0]];
  }
  return item.url + item.list[0] + '@2x.png';
});

/**
 * Converts a basic emoji key into its corresponding name.
 * Example:
 * '[Smile]' => '[TUIEmoji_Smile]'
 * @param {string} key - The emoji key.
 * @return {string} The corresponding emoji name.
 */
const convertKeyToEmojiName = (key: string): string => {
  return TUITranslateService.t(`Emoji.${key}`);
};

/**
 * Transforms a text containing emoji keys into a text with Chinese or English basic emoji names
 * Example:
 * 'hello[TUIEmoji_Smile]!' => 'hello[Smile]!''
 * @param {string} text - The text containing emoji keys.
 * @return {string} The transformed text with emoji keys replaced by emoji names.
 */
const transformTextWithKeysToEmojiNames = (text: string): string => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => BASIC_EMOJI_URL_MAPPING[match] ? convertKeyToEmojiName(match) : match);
  }
  return txt;
};

/**
 * Transforms a text containing Chinese or English basic emoji names into a text with emoji keys.
 * Example:
 * 'hello[Smile]!' => 'hello[TUIEmoji_Smile]!'
 * @param {string} text - The text containing emoji names.
 * @return {string} The transformed text with emoji names replaced by emoji keys.
 */
const transformTextWithEmojiNamesToKeys = (text: string) => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => BASIC_EMOJI_NAME_TO_KEY_MAPPING[match] || match);
  }
  return txt;
};

export {
  EMOJI_TYPE,
  TAB_ICON_LIST,
  EMOJI_GROUP_LIST,
  DEFAULT_BIG_EMOJI_URL,
  BASIC_EMOJI_URL_MAPPING,
  convertKeyToEmojiName,
  transformTextWithKeysToEmojiNames,
  transformTextWithEmojiNamesToKeys,
};
