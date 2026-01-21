const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O (confusing)
const NUMBERS = '0123456789';

const randomChar = (chars: string): string => {
  return chars[Math.floor(Math.random() * chars.length)];
};

// Generates codes like: ABCD-1234
export const generateLobbyCode = (): string => {
  const letters = Array(4).fill(0).map(() => randomChar(LETTERS)).join('');
  const numbers = Array(4).fill(0).map(() => randomChar(NUMBERS)).join('');
  return `${letters}-${numbers}`;
};

// Normalizes input code (uppercase, trim)
export const normalizeCode = (code: string): string => {
  return code.toUpperCase().trim();
};

// Validates code format
export const isValidCodeFormat = (code: string): boolean => {
  const pattern = /^[A-Z]{4}-[0-9]{4}$/;
  return pattern.test(normalizeCode(code));
};
