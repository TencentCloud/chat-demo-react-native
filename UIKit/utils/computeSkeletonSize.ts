export const computeSkeletonSize = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } => {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const widthToHeight = width / height;
  const maxWidthToHeight = maxWidth / maxHeight;
  if (
    (width <= maxWidth && height > maxHeight)
    || (width > maxWidth && height > maxHeight && widthToHeight <= maxWidthToHeight)
  ) {
    return { width: width * (maxHeight / height), height: maxHeight };
  }

  return { width: maxWidth, height: height * (maxWidth / width) };
};
