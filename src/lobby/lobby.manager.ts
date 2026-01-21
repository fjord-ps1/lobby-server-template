import { Lobby, LobbySettings } from '../types/lobby';
import { Player } from '../types/player';
import { createLobby, addPlayerToLobby, removePlayerFromLobby, updateLobbySettings, updateLobbyStatus } from './lobby.model';
import { normalizeCode } from './lobby.codes';
import { generateId } from '../utils/id';
import { now } from '../utils/time';
import { logger } from '../utils/logger';

class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private players: Map<string, Player> = new Map();
  private lobbyByCode: Map<string, string> = new Map(); // code -> lobbyId
  private playerBySocket: Map<string, string> = new Map(); // socketId -> playerId

  // === LOBBY OPERATIONS ===

  createLobby(socketId: string, playerName: string, lobbyName: string, settings?: Partial<LobbySettings>): { lobby: Lobby; player: Player } {
    const player = this.createPlayer(socketId, playerName);
    const lobby = createLobby(player.id, lobbyName, settings);
    
    player.lobbyId = lobby.id;
    player.isHost = true;

    this.lobbies.set(lobby.id, lobby);
    this.lobbyByCode.set(lobby.code, lobby.id);
    this.players.set(player.id, player);
    this.playerBySocket.set(socketId, player.id);

    logger.info('Lobby created', { lobbyId: lobby.id, code: lobby.code, host: playerName });
    return { lobby, player };
  }

  joinLobby(socketId: string, playerName: string, code: string): { lobby: Lobby; player: Player } | null {
    const normalizedCode = normalizeCode(code);
    const lobbyId = this.lobbyByCode.get(normalizedCode);
    
    if (!lobbyId) return null;
    
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const player = this.createPlayer(socketId, playerName);
    player.lobbyId = lobby.id;

    const updatedLobby = addPlayerToLobby(lobby, player.id);
    
    this.lobbies.set(lobby.id, updatedLobby);
    this.players.set(player.id, player);
    this.playerBySocket.set(socketId, player.id);

    logger.info('Player joined lobby', { lobbyId: lobby.id, playerName });
    return { lobby: updatedLobby, player };
  }

  leaveLobby(socketId: string): { lobby: Lobby | null; playerId: string; wasClosed: boolean } | null {
    const playerId = this.playerBySocket.get(socketId);
    if (!playerId) return null;

    const player = this.players.get(playerId);
    if (!player || !player.lobbyId) return null;

    const lobby = this.lobbies.get(player.lobbyId);
    if (!lobby) return null;

    let updatedLobby = removePlayerFromLobby(lobby, playerId);
    let wasClosed = false;

    // If host left or lobby empty, close it
    if (lobby.hostId === playerId || updatedLobby.playerIds.length === 0) {
      this.closeLobby(lobby.id);
      wasClosed = true;
      updatedLobby = updateLobbyStatus(updatedLobby, 'closed');
    } else {
      this.lobbies.set(lobby.id, updatedLobby);
    }

    // Cleanup player
    this.players.delete(playerId);
    this.playerBySocket.delete(socketId);

    logger.info('Player left lobby', { lobbyId: lobby.id, playerId, wasClosed });
    return { lobby: wasClosed ? null : updatedLobby, playerId, wasClosed };
  }

  closeLobby(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    // Remove all players
    for (const playerId of lobby.playerIds) {
      const player = this.players.get(playerId);
      if (player) {
        this.playerBySocket.delete(player.socketId);
        this.players.delete(playerId);
      }
    }

    this.lobbyByCode.delete(lobby.code);
    this.lobbies.delete(lobbyId);
    
    logger.info('Lobby closed', { lobbyId });
  }

  updateSettings(socketId: string, settings: Partial<LobbySettings>): Lobby | null {
    const player = this.getPlayerBySocket(socketId);
    if (!player || !player.lobbyId || !player.isHost) return null;

    const lobby = this.lobbies.get(player.lobbyId);
    if (!lobby) return null;

    const updatedLobby = updateLobbySettings(lobby, settings);
    this.lobbies.set(lobby.id, updatedLobby);

    return updatedLobby;
  }

  startGame(socketId: string): Lobby | null {
    const player = this.getPlayerBySocket(socketId);
    if (!player || !player.lobbyId || !player.isHost) return null;

    const lobby = this.lobbies.get(player.lobbyId);
    if (!lobby || lobby.status !== 'waiting') return null;

    const updatedLobby = updateLobbyStatus(lobby, 'in-game');
    this.lobbies.set(lobby.id, updatedLobby);

    logger.info('Game started', { lobbyId: lobby.id });
    return updatedLobby;
  }

  // === PLAYER OPERATIONS ===

  private createPlayer(socketId: string, name: string): Player {
    return {
      id: generateId(),
      socketId,
      name,
      lobbyId: null,
      status: 'connected',
      isHost: false,
      joinedAt: now()
    };
  }

  getPlayerBySocket(socketId: string): Player | null {
    const playerId = this.playerBySocket.get(socketId);
    if (!playerId) return null;
    return this.players.get(playerId) || null;
  }

  getPlayersInLobby(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return [];
    return lobby.playerIds
      .map(id => this.players.get(id))
      .filter((p): p is Player => p !== undefined);
  }

  // === GETTERS ===

  getLobby(lobbyId: string): Lobby | null {
    return this.lobbies.get(lobbyId) || null;
  }

  getLobbyByCode(code: string): Lobby | null {
    const lobbyId = this.lobbyByCode.get(normalizeCode(code));
    if (!lobbyId) return null;
    return this.lobbies.get(lobbyId) || null;
  }
}

export const lobbyManager = new LobbyManager();
