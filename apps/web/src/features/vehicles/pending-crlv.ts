let pendingFile: File | null = null;

export const setPendingCrlv = (file: File): void => {
  pendingFile = file;
};

export const readPendingCrlv = (): File | null => pendingFile;

export const clearPendingCrlv = (): void => {
  pendingFile = null;
};
