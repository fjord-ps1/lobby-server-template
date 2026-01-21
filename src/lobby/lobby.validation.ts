import { Lobby, LobbySettings } from '../types/lobby';
import { isValidCodeFormat } from './lobby.codes';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateLobbyName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Lobby name is required' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Lobby name too long (max 50 chars)' };
  }
  return { valid: true };
};

export const validatePlayerName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Player name is required' };
  }
  if (name.length > 30) {
    return { valid: false, error: 'Player name too long (max 30 chars)' };
  }
  return { valid: true };
};

export const validateJoinCode = (code: string): ValidationResult => {
  if (!code) {
    return { valid: false, error: 'Lobby code is required' };
  }
  if (!isValidCodeFormat(code)) {
    return { valid: false, error: 'Invalid code format (expected ABCD-1234)' };
  }
  return { valid: true };
};

export const validateCanJoin = (lobby: Lobby): ValidationResult => {
  if (lobby.status !== 'waiting') {
    return { valid: false, error: 'Lobby is not accepting players' };
  }
  if (lobby.playerIds.length >= lobby.settings.maxPlayers) {
    return { valid: false, error: 'Lobby is full' };
  }
  return { valid: true };
};

export const validateSettings = (settings: Partial<LobbySettings>): ValidationResult => {
  if (settings.maxPlayers !== undefined) {
    if (settings.maxPlayers < 2 || settings.maxPlayers > 100) {
      return { valid: false, error: 'Max players must be between 2 and 100' };
    }
  }
  return { valid: true };
};
