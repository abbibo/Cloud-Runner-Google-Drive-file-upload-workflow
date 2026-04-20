export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const isValidImageFormat = (file: File): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
};

export const isValidSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE_BYTES;
};
