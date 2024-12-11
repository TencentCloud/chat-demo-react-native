export const parseJSON = (value: any): any => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};
