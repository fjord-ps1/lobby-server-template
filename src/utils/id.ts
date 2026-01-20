export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
