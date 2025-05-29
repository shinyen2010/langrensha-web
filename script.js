const MAX_PLAYERS = 12;
const roles = ["狼人", "狼人", "预言家", "女巫", "猎人", "平民", "平民", "平民", "平民", "平民", "平民", "平民"];
let players = [];
let gameStarted = false;
let timerInterval;
let currentPhase = "";
let countdown = 30;

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();
  if (!name || players.length >= MAX_PLAYERS) return;
  players.push({ name, role: "", alive: true, voted: null });
  nameInput.value = "";
  renderPlayers();
}

function renderPlayers() {
  const ul = document.getElementById("playerList");
  ul.innerHTML = "";
  players.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.alive ? "存活" : "死亡"})`;
    li.className = p.alive ? "" : "dead";
    ul.appendChild(li);
  });
}

function startGame() {
  if (players.length < 5 || gameStarted) return;
  gameStarted = true;
  assignRoles();
  logMessage("游戏开始，夜晚降临...");
  nightPhase();
}

function assignRoles() {
  const shuffled = [...roles].sort(() => 0.5 - Math.random());
  players = players.map((p, i) => ({ ...p, role: shuffled[i], alive: true }));
}

function nightPhase() {
  currentPhase = "night";
  playSound("nightSfx");
  countdownStart(30, () => {
    const alivePlayers = players.filter(p => p.alive);
    const targets = alivePlayers.filter(p => p.role !== "狼人");
    const killed = targets[Math.floor(Math.random() * targets.length)];
    logMessage(`夜晚过去了。`);

    // 女巫逻辑
    let save = Math.random() < 0.5;
    if (save) {
      logMessage(`女巫使用了解药救了 ${killed.name}`);
    } else {
      killed.alive = false;
      logMessage(`${killed.name} 死于昨夜！`);
    }

    renderPlayers();
    setTimeout(dayPhase, 2000);
  });
}

function dayPhase() {
  currentPhase = "day";
  playSound("daySfx");
  logMessage("天亮了，请开始讨论。");
  countdownStart(30, votePhase);
}

function votePhase() {
  const alive = players.filter(p => p.alive);
  const votedOut = alive[Math.floor(Math.random() * alive.length)];
  votedOut.alive = false;
  logMessage(`${votedOut.name} 被投票驱逐！身份：${votedOut.role}`);
  renderPlayers();
  setTimeout(nightPhase, 3000);
}

function countdownStart(seconds, callback) {
  countdown = seconds;
  document.getElementById("timer").textContent = countdown;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    countdown--;
    document.getElementById("timer").textContent = countdown;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      callback();
    }
  }, 1000);
}

function logMessage(msg) {
  const log = document.getElementById("gameLog");
  log.innerHTML += `<p>${msg}</p>`;
  log.scrollTop = log.scrollHeight;
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

function resetGame() {
  players = [];
  gameStarted = false;
  document.getElementById("gameLog").innerHTML = "";
  document.getElementById("timer").textContent = "-";
  clearInterval(timerInterval);
  renderPlayers();
}