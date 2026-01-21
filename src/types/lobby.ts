export type LobbyStatus = 'waiting' | 'starting' | 'in-game' | 'closed';

export interface LobbySettings {
  maxPlayers: number;
  isPrivate: boolean;
  gameMode?: string;
  customData?: Record<string, any>;
}

export interface Lobby {
  id: string;
  code: string;
  name: string;
  hostId: string;
  status: LobbyStatus;
  settings: LobbySettings;
  playerIds: string[];
  createdAt: number;
  updatedAt: number;
}
