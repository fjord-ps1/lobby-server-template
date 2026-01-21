const socket = io();

// State
let currentPlayer = null;
let currentLobby = null;
let isHost = false;

// DOM Elements
const statusEl = document.getElementById('status');
const preLobbyEl = document.getElementById('pre-lobby');
const inLobbyEl = document.getElementById('in-lobby');
const playerNameEl = document.getElementById('playerName');
const lobbyNameEl = document.getElementById('lobbyName');
const joinCodeEl = document.getElementById('joinCode');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const startBtn = document.getElementById('startBtn');
const lobbyTitleEl = document.getElementById('lobbyTitle');
const lobbyCodeEl = document.getElementById('lobbyCode');
const playerListEl = document.getElementById('playerList');
const logListEl = document.getElementById('logList');

// Logging
function log(msg, type = '') {
  const entry = document.createElement('div');
  entry.className = 'log-entry ' + type;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logListEl.prepend(entry);
}

// UI Updates
function showLobby() {
  preLobbyEl.classList.add('hidden');
  inLobbyEl.classList.remove('hidden');
}

function showPreLobby() {
  preLobbyEl.classList.remove('hidden');
  inLobbyEl.classList.add('hidden');
  currentLobby = null;
  currentPlayer = null;
  isHost = false;
}

function updateLobbyUI() {
  if (!currentLobby) return;
  
  lobbyTitleEl.textContent = currentLobby.name;
  lobbyCodeEl.textContent = currentLobby.code;
  
  // Show start button only for host
  if (isHost && currentLobby.status === 'waiting') {
    startBtn.classList.remove('hidden');
  } else {
    startBtn.classList.add('hidden');
  }
}

function updatePlayerList(players) {
  playerListEl.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    if (p.isHost) li.classList.add('host');
    if (currentPlayer && p.id === currentPlayer.id) li.classList.add('you');
    playerListEl.appendChild(li);
  });
}

// Socket Connection
socket.on('connect', () => {
  statusEl.textContent = 'Connected';
  statusEl.className = 'status connected';
  log('Connected to server', 'success');
});

socket.on('disconnect', () => {
  statusEl.textContent = 'Disconnected';
  statusEl.className = 'status disconnected';
  log('Disconnected from server', 'error');
  showPreLobby();
});

// Lobby Events
socket.on('lobby:created', (data) => {
  currentLobby = data.lobby;
  currentPlayer = data.player;
  isHost = true;
  log(`Created lobby: ${data.lobby.code}`, 'success');
  updateLobbyUI();
  updatePlayerList([data.player]);
  showLobby();
});

socket.on('lobby:joined', (data) => {
  currentLobby = data.lobby;
  currentPlayer = data.player;
  isHost = false;
  log(`Joined lobby: ${data.lobby.code}`, 'success');
  updateLobbyUI();
  // Request full player list would need server support, for now just show self
  showLobby();
});

socket.on('lobby:updated', (data) => {
  currentLobby = data.lobby;
  updateLobbyUI();
  log('Lobby updated');
});

socket.on('lobby:left', (data) => {
  log('You left the lobby');
  showPreLobby();
});

socket.on('lobby:closed', (data) => {
  log(`Lobby closed: ${data.reason}`, 'error');
  showPreLobby();
});

socket.on('lobby:started', () => {
  log('Game started!', 'success');
});

// Player Events
socket.on('player:joined', (data) => {
  log(`${data.player.name} joined`);
});

socket.on('player:left', (data) => {
  log(`Player left: ${data.playerId}`);
});

// Errors
socket.on('error', (data) => {
  log(`Error [${data.code}]: ${data.message}`, 'error');
});

// Button Handlers
createBtn.addEventListener('click', () => {
  const playerName = playerNameEl.value.trim();
  const lobbyName = lobbyNameEl.value.trim() || 'My Lobby';
  
  if (!playerName) {
    log('Enter your name first', 'error');
    return;
  }
  
  socket.emit('lobby:create', { name: lobbyName, playerName });
});

joinBtn.addEventListener('click', () => {
  const playerName = playerNameEl.value.trim();
  const code = joinCodeEl.value.trim().toUpperCase();
  
  if (!playerName) {
    log('Enter your name first', 'error');
    return;
  }
  
  if (!code) {
    log('Enter lobby code', 'error');
    return;
  }
  
  socket.emit('lobby:join', { code, playerName });
});

leaveBtn.addEventListener('click', () => {
  socket.emit('lobby:leave');
});

startBtn.addEventListener('click', () => {
  socket.emit('lobby:start');
});

// Auto-format lobby code input
joinCodeEl.addEventListener('input', (e) => {
  let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (val.length > 4) {
    val = val.slice(0, 4) + '-' + val.slice(4, 8);
  }
  e.target.value = val;
});
