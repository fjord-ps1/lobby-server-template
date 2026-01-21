import { Lobby, LobbySettings, LobbyStatus } from '../types/lobby';
import { generateId } from '../utils/id';
import { generateLobbyCode } from './lobby.codes';
import { now } from '../utils/time';

const DEFAULT_SETTINGS: LobbySettings = {
  maxPlayers: 8,
  isPrivate: false
};

export const createLobby = (
  hostId: string,
  name: string,
  settings?: Partial<LobbySettings>
): Lobby => {
  const timestamp = now();
  
  return {
    id: generateId(),
    code: generateLobbyCode(),
    name,
    hostId,
    status: 'waiting',
    settings: { ...DEFAULT_SETTINGS, ...settings },
    playerIds: [hostId],
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

export const updateLobbyStatus = (lobby: Lobby, status: LobbyStatus): Lobby => {
  return { ...lobby, status, updatedAt: now() };
};

export const updateLobbySettings = (lobby: Lobby, settings: Partial<LobbySettings>): Lobby => {
  return { 
    ...lobby, 
    settings: { ...lobby.settings, ...settings },
    updatedAt: now()
  };
};

export const addPlayerToLobby = (lobby: Lobby, playerId: string): Lobby => {
  return {
    ...lobby,
    playerIds: [...lobby.playerIds, playerId],
    updatedAt: now()
  };
};

export const removePlayerFromLobby = (lobby: Lobby, playerId: string): Lobby => {
  return {
    ...lobby,
    playerIds: lobby.playerIds.filter(id => id !== playerId),
    updatedAt: now()
  };
};
