import { Server, Socket } from 'socket.io';
import { ClientEvents, ServerEvents } from '../types/events';
import { lobbyManager } from '../lobby/lobby.manager';
import { validateLobbyName, validatePlayerName, validateJoinCode, validateCanJoin, validateSettings } from '../lobby/lobby.validation';
import { logger } from '../utils/logger';

type IOServer = Server<ClientEvents, ServerEvents>;
type IOSocket = Socket<ClientEvents, ServerEvents>;

const emitError = (socket: IOSocket, code: string, message: string) => {
  socket.emit('error', { code, message });
};

export const registerHandlers = (io: IOServer, socket: IOSocket) => {
  
  // === CREATE LOBBY ===
  socket.on('lobby:create', (data) => {
    const nameCheck = validateLobbyName(data.name);
    if (!nameCheck.valid) {
      return emitError(socket, 'INVALID_LOBBY_NAME', nameCheck.error!);
    }

    const playerCheck = validatePlayerName(data.playerName);
    if (!playerCheck.valid) {
      return emitError(socket, 'INVALID_PLAYER_NAME', playerCheck.error!);
    }

    if (data.settings) {
      const settingsCheck = validateSettings(data.settings);
      if (!settingsCheck.valid) {
        return emitError(socket, 'INVALID_SETTINGS', settingsCheck.error!);
      }
    }

    const result = lobbyManager.createLobby(socket.id, data.playerName, data.name, data.settings);
    
    socket.join(result.lobby.id);
    socket.emit('lobby:created', result);
    
    logger.info('Lobby created via socket', { code: result.lobby.code });
  });

  // === JOIN LOBBY ===
  socket.on('lobby:join', (data) => {
    const codeCheck = validateJoinCode(data.code);
    if (!codeCheck.valid) {
      return emitError(socket, 'INVALID_CODE', codeCheck.error!);
    }

    const playerCheck = validatePlayerName(data.playerName);
    if (!playerCheck.valid) {
      return emitError(socket, 'INVALID_PLAYER_NAME', playerCheck.error!);
    }

    const lobby = lobbyManager.getLobbyByCode(data.code);
    if (!lobby) {
      return emitError(socket, 'LOBBY_NOT_FOUND', 'Lobby not found');
    }

    const canJoin = validateCanJoin(lobby);
    if (!canJoin.valid) {
      return emitError(socket, 'CANNOT_JOIN', canJoin.error!);
    }

    const result = lobbyManager.joinLobby(socket.id, data.playerName, data.code);
    if (!result) {
      return emitError(socket, 'JOIN_FAILED', 'Failed to join lobby');
    }

    socket.join(result.lobby.id);
    socket.emit('lobby:joined', result);
    socket.to(result.lobby.id).emit('player:joined', { player: result.player });
    socket.to(result.lobby.id).emit('lobby:updated', { lobby: result.lobby });
  });

  // === LEAVE LOBBY ===
  socket.on('lobby:leave', () => {
    const result = lobbyManager.leaveLobby(socket.id);
    if (!result) return;

    socket.emit('lobby:left', { playerId: result.playerId });

    if (result.wasClosed) {
      io.to(result.playerId).emit('lobby:closed', { reason: 'Host left the lobby' });
    } else if (result.lobby) {
      socket.to(result.lobby.id).emit('player:left', { playerId: result.playerId });
      socket.to(result.lobby.id).emit('lobby:updated', { lobby: result.lobby });
    }
  });

  // === KICK PLAYER ===
  socket.on('lobby:kick', (data) => {
    const player = lobbyManager.getPlayerBySocket(socket.id);
    if (!player || !player.isHost || !player.lobbyId) {
      return emitError(socket, 'NOT_HOST', 'Only host can kick players');
    }

    const targetPlayer = lobbyManager.getPlayersInLobby(player.lobbyId)
      .find(p => p.id === data.playerId);
    
    if (!targetPlayer) {
      return emitError(socket, 'PLAYER_NOT_FOUND', 'Player not found in lobby');
    }

    // Simulate leave for kicked player
    const result = lobbyManager.leaveLobby(targetPlayer.socketId);
    if (!result) return;

    io.to(targetPlayer.socketId).emit('lobby:closed', { reason: 'You were kicked from the lobby' });
    
    if (result.lobby) {
      io.to(result.lobby.id).emit('player:left', { playerId: data.playerId });
      io.to(result.lobby.id).emit('lobby:updated', { lobby: result.lobby });
    }
  });

  // === UPDATE SETTINGS ===
  socket.on('lobby:settings', (data) => {
    const settingsCheck = validateSettings(data);
    if (!settingsCheck.valid) {
      return emitError(socket, 'INVALID_SETTINGS', settingsCheck.error!);
    }

    const lobby = lobbyManager.updateSettings(socket.id, data);
    if (!lobby) {
      return emitError(socket, 'UPDATE_FAILED', 'Failed to update settings (not host?)');
    }

    io.to(lobby.id).emit('lobby:updated', { lobby });
  });

  // === START GAME ===
  socket.on('lobby:start', () => {
    const lobby = lobbyManager.startGame(socket.id);
    if (!lobby) {
      return emitError(socket, 'START_FAILED', 'Failed to start game (not host or not waiting?)');
    }

    io.to(lobby.id).emit('lobby:started');
    io.to(lobby.id).emit('lobby:updated', { lobby });
  });

  // === DISCONNECT CLEANUP ===
  socket.on('disconnect', () => {
    const result = lobbyManager.leaveLobby(socket.id);
    if (!result) return;

    if (result.wasClosed && result.lobby) {
      io.to(result.lobby.id).emit('lobby:closed', { reason: 'Host disconnected' });
    } else if (result.lobby) {
      io.to(result.lobby.id).emit('player:left', { playerId: result.playerId });
      io.to(result.lobby.id).emit('lobby:updated', { lobby: result.lobby });
    }
  });
};
