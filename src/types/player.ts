export type PlayerStatus = 'connected' | 'ready' | 'in-game' | 'disconnected';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  lobbyId: string | null;
  status: PlayerStatus;
  isHost: boolean;
  joinedAt: number;
  customData?: Record<string, any>;
}
