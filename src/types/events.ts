import { Lobby, LobbySettings } from './lobby';
import { Player } from './player';

// Client -> Server events
export interface ClientEvents {
  'lobby:create': (data: { name: string; playerName: string; settings?: Partial<LobbySettings> }) => void;
  'lobby:join': (data: { code: string; playerName: string }) => void;
  'lobby:leave': () => void;
  'lobby:kick': (data: { playerId: string }) => void;
  'lobby:settings': (data: Partial<LobbySettings>) => void;
  'lobby:start': () => void;
  'player:ready': (data: { ready: boolean }) => void;
}

// Server -> Client events
export interface ServerEvents {
  'lobby:created': (data: { lobby: Lobby; player: Player }) => void;
  'lobby:joined': (data: { lobby: Lobby; player: Player }) => void;
  'lobby:left': (data: { playerId: string }) => void;
  'lobby:updated': (data: { lobby: Lobby }) => void;
  'lobby:closed': (data: { reason: string }) => void;
  'lobby:started': () => void;
  'player:joined': (data: { player: Player }) => void;
  'player:left': (data: { playerId: string }) => void;
  'player:updated': (data: { player: Player }) => void;
  'error': (data: { code: string; message: string }) => void;
}
