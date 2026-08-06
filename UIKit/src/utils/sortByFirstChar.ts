import { getChinesePinyinFirstLetter } from './getChinesePinyinFirstLetter';

export const getFirstCharKey = (str: string): string => {
  if (!str) return '#';
  const ch = str.charAt(0);
  if (/\d/.test(ch)) return '#';
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  if (/[一-鿿]/.test(ch)) {
    const pinyin = getChinesePinyinFirstLetter(ch);
    return pinyin.charAt(0).toUpperCase();
  }
  return '#';
};

export const strCompare = (a: string, b: string): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export const sortByFirstChar = <T extends Record<string, unknown>>(
  list: T[],
  getDisplayName: (item: T) => string,
  enableGroup = true
): { sortedList: T[]; groupedList: Record<string, T[]> } => {
  const sortedList = [...list].sort((a, b) => {
    const na = getDisplayName(a);
    const nb = getDisplayName(b);
    const ka = getFirstCharKey(na);
    const kb = getFirstCharKey(nb);
    if (ka !== kb) return strCompare(ka, kb);
    return strCompare(na, nb);
  });
  if (!enableGroup) return { sortedList, groupedList: {} };
  const groupedList: Record<string, T[]> = {};
  for (const item of sortedList) {
    const k = getFirstCharKey(getDisplayName(item));
    if (!groupedList[k]) groupedList[k] = [];
    groupedList[k].push(item);
  }
  return { sortedList, groupedList };
};
