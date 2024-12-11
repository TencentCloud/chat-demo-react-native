import { USER_AVATAR_DEFAULT } from '../../constant';

export const handleImageUrl = (url: string) => {
  const regHttp = /^(http|https):\/\//i;
  if (!url || !regHttp.test(url)) {
    return USER_AVATAR_DEFAULT;
  }
  const reg = /[^/]*\.svg$/;
  const matches = url.match(reg);
  if (matches) {
    const newFileName = matches[0].toLowerCase().replace('.svg', '.png');
    return url.replace(reg, newFileName);
  }
  return url;
};
