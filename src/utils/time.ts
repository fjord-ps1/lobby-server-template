export const now = (): number => Date.now();

export const secondsAgo = (timestamp: number): number => {
  return Math.floor((Date.now() - timestamp) / 1000);
};

export const minutesAgo = (timestamp: number): number => {
  return Math.floor((Date.now() - timestamp) / 60000);
};
