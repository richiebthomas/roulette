// DOM Elements
const configPage = document.getElementById('config-page');
const gamePage = document.getElementById('game-page');
const playerCountInput = document.getElementById('player-count');
const playerCountValue = document.getElementById('player-count-value');
const playerInputsContainer = document.getElementById('player-inputs');
const playerSelect = document.getElementById('player-select');
const startGameButton = document.getElementById('start-game');
const resetGameButton = document.getElementById('reset-game');
const gunLogo = document.getElementById('gun-logo');
const gameLog = document.getElementById('game-log');

// Game State
let players = [];         // initial list from the inputs
let alivePlayers = [];    // players still in the game
let selectedPlayer = null;
let remainingChambers = 6;

// Update Player Inputs when the count changes
function updatePlayerInputs() {
  const playerCount = parseInt(playerCountInput.value);
  playerCountValue.textContent = playerCount;

  // Clear existing inputs
  playerInputsContainer.innerHTML = '';

  // Add new inputs
  for (let i = 0; i < playerCount; i++) {
    const playerInput = document.createElement('div');
    playerInput.className = 'player-input';
    playerInput.innerHTML = `
      <label>Player ${i + 1} Name:</label>
      <input type="text" class="player-name" value="Player ${i + 1}">
    `;
    playerInputsContainer.appendChild(playerInput);
  }
}

// Initialize players and update the dropdown for turn selection
function initializePlayers() {
  // Build the players array from inputs
  players = Array.from(document.querySelectorAll('.player-name')).map(input => input.value);
  // At game start, all players are alive
  alivePlayers = [...players];
  updatePlayerDropdown();
}

// Update the dropdown to list only alive players
function updatePlayerDropdown() {
  playerSelect.innerHTML = '';
  alivePlayers.forEach((player, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = player;
    playerSelect.appendChild(option);
  });
  // Set selectedPlayer to the first alive player, if any exist
  selectedPlayer = alivePlayers.length > 0 ? alivePlayers[0] : null;
}

// Rotate to the next player's turn after a shot
function rotatePlayer() {
  if (alivePlayers.length === 0) {
    selectedPlayer = null;
    return;
  }
  // Find current player's index in the alivePlayers list
  let currentIndex = alivePlayers.indexOf(selectedPlayer);
  if (currentIndex === -1) currentIndex = 0;
  // Move to the next player (wrap around if needed)
  const nextIndex = (currentIndex + 1) % alivePlayers.length;
  selectedPlayer = alivePlayers[nextIndex];
  // Reflect change in the dropdown
  playerSelect.value = nextIndex;
}

// (Optional) Update additional game state UI elements
function updateGameState() {
  // For example, update a “chambers left” display if you have one
  const chambersDisplay = document.getElementById('chambers-left');
  if (chambersDisplay) {
    chambersDisplay.textContent = remainingChambers;
  }
  // Also refresh the dropdown options (in case a player died)
  updatePlayerDropdown();
}

// Fire Function (simulate a shot)
function fire() {
  // Check if there are no chambers left
  if (remainingChambers <= 0) {
    addLog("No more chambers left! It's a draw.");
    gunLogo.removeEventListener('click', fire);
    return;
  }
  // If no current player or no alive players, do nothing
  if (!selectedPlayer || alivePlayers.length === 0) return;

  const chance = 1 / remainingChambers;
  const random = Math.random();

  if (random < chance) {
    // Player dies
    addLog(`${selectedPlayer} fired... BANG! 💀 They died.`);
    document.body.classList.add('flash-red');
    // Remove the dead player from alivePlayers (ensuring only that instance is removed)
    alivePlayers = alivePlayers.filter(player => player !== selectedPlayer);
  } else {
    // Player survives
    addLog(`${selectedPlayer} fired... click. 🔥 They survived.`);
    document.body.classList.add('flash-green');
  }

  // Remove flash class after animation
  setTimeout(() => {
    document.body.classList.remove('flash-green', 'flash-red');
  }, 500);

  // Decrement remaining chambers for each shot taken
  remainingChambers--;

  // Check for game over conditions
  if (alivePlayers.length === 1) {
    addLog(`🎉 ${alivePlayers[0]} is the winner! 🎉`);
    gunLogo.removeEventListener('click', fire);
    updateGameState();
    return;
  } else if (alivePlayers.length === 0) {
    addLog(`💀 Everyone died! Game over. 💀`);
    gunLogo.removeEventListener('click', fire);
    updateGameState();
    return;
  } else if (remainingChambers <= 0) {
    addLog("No more chambers left! It's a draw.");
    gunLogo.removeEventListener('click', fire);
    updateGameState();
    return;
  }

  // Advance to the next player's turn
  rotatePlayer();
  updateGameState();
}

// Reset Game
function resetGame() {
  remainingChambers = 6;
  gameLog.innerHTML = '';
  initializePlayers();
  gunLogo.addEventListener('click', fire); // Re-enable firing
  updateGameState();
}

// Add Log Entry (replaces previous log entry)
function addLog(message) {
  gameLog.innerHTML = `<div class="log-entry">${message}</div>`;
}

// Switch to Game Page and initialize players
function startGame() {
  initializePlayers();
  configPage.classList.add('hidden');
  gamePage.classList.remove('hidden');
  updateGameState();
}

// Event Listeners
playerCountInput.addEventListener('input', updatePlayerInputs);
playerSelect.addEventListener('change', () => {
  const index = parseInt(playerSelect.value, 10);
  selectedPlayer = alivePlayers[index];
});
gunLogo.addEventListener('click', fire);
startGameButton.addEventListener('click', startGame);
resetGameButton.addEventListener('click', resetGame);

// Initialize player inputs on page load
updatePlayerInputs();
