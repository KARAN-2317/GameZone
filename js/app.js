
/* =========================================
   GAMEZONE - MINI GAMING HUB
   Developed by Karan Dev
========================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE_KEY = "gamezoneData";

const defaultData = {
  username: "Player",
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  dailyStreak: 1,
  lastPlayed: "",
  scores: {}
};

let data = loadData();
let currentFilter = "all";
let soundEnabled = true;
let activeGame = null;
let gameCompleted = false;
let gameTimer = null;

function loadData() {
  try {
    return {
      ...defaultData,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  } catch {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

const games = [
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    category: "brain",
    icon: "⭕",
    color: "purple",
    description: "Beat the computer in this classic battle.",
    guide: "You are X and the computer is O. Take turns selecting empty boxes. Make a line of three symbols horizontally, vertically, or diagonally to win."
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    category: "quick",
    icon: "✊",
    color: "orange",
    description: "Challenge the computer in a quick match.",
    guide: "Choose Rock, Paper, or Scissors. Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. Win as many rounds as you can."
  },
  {
    id: "number",
    name: "Number Guess",
    category: "brain",
    icon: "🔢",
    color: "blue",
    description: "Find the hidden number from 1 to 100.",
    guide: "The computer has selected a number between 1 and 100. Enter your guess. You get 7 attempts and receive hints telling you whether to go higher or lower."
  },
  {
    id: "memory",
    name: "Memory Match",
    category: "brain",
    icon: "🧠",
    color: "pink",
    description: "Match all the hidden emoji pairs.",
    guide: "Click two cards to reveal them. If they match, they stay open. If not, they turn back over. Match all 6 pairs to win."
  },
  {
    id: "math",
    name: "Quick Math",
    category: "quick",
    icon: "➗",
    color: "green",
    description: "Solve as many maths questions as possible.",
    guide: "Solve 5 maths questions. Select or enter the correct answer. Every correct answer earns points. Try to get a perfect score."
  },
  {
    id: "scramble",
    name: "Word Scramble",
    category: "brain",
    icon: "🔤",
    color: "yellow",
    description: "Unscramble letters to discover the word.",
    guide: "A word is shown with its letters mixed up. Rearrange the letters and type the correct word. You get 3 attempts."
  },
  {
    id: "reaction",
    name: "Reaction Test",
    category: "arcade",
    icon: "⚡",
    color: "orange",
    description: "Test how quickly you can react.",
    guide: "Press Start and wait for the screen to turn green. Click as quickly as possible. Do not click before it turns green or your attempt will be false-started."
  },
  {
    id: "color",
    name: "Color Match",
    category: "arcade",
    icon: "🎨",
    color: "pink",
    description: "Match the displayed color correctly.",
    guide: "Look at the target color and select the matching color from the options. Complete 5 rounds to finish the game."
  },
  {
    id: "dice",
    name: "Dice Duel",
    category: "quick",
    icon: "🎲",
    color: "blue",
    description: "Roll the dice and beat the computer.",
    guide: "You and the computer each roll a dice. The higher number wins the round. Play 5 rounds and try to beat the computer."
  }
];

/* ---------- SOUND ---------- */

function beep(frequency = 500) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(audio.destination);

    gain.gain.setValueAtTime(0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + 0.15
    );

    oscillator.start();
    oscillator.stop(audio.currentTime + 0.15);
    oscillator.onended = () => audio.close();
  } catch (error) {
    console.log("Sound unavailable");
  }
}

/* ---------- NAVIGATION ---------- */

function showPage(pageName) {
  $$(".page").forEach(page => page.classList.remove("active"));

  const target = $("#" + pageName);
  if (target) target.classList.add("active");

  $$("[data-page]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  $("#sidebar")?.classList.remove("open");
  $("#mobileOverlay")?.classList.remove("show");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

$("#menuToggle")?.addEventListener("click", () => {
  $("#sidebar")?.classList.toggle("open");
  $("#mobileOverlay")?.classList.toggle("show");
});

$("#mobileOverlay")?.addEventListener("click", () => {
  $("#sidebar")?.classList.remove("open");
  $("#mobileOverlay")?.classList.remove("show");
});

/* ---------- GAME CARDS ---------- */

function gameCard(game) {
  return `
    <article class="game-card">
      <div class="game-art ${game.color}">
        <span>${game.icon}</span>
      </div>

      <div class="game-info">
        <div class="game-meta">
          <span>${game.category}</span>
          <span>⭐ ${data.scores[game.id] || 0} pts</span>
        </div>

        <h3>${game.name}</h3>
        <p>${game.description}</p>

        <div class="game-actions">
          <button class="game-play-btn"
            data-play="${game.id}">
            Play Now
          </button>

          <button class="game-guide-btn"
            data-guide="${game.id}">
            Guide
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderGames() {
  const search = ($("#gameSearch")?.value || "").toLowerCase();

  const filtered = games.filter(game => {
    const matchesCategory =
      currentFilter === "all" ||
      game.category === currentFilter;

    const matchesSearch =
      game.name.toLowerCase().includes(search) ||
      game.description.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  const allGames = $("#allGames");
  if (allGames) {
    allGames.innerHTML = filtered.map(gameCard).join("");
  }

  const empty = $("#noGames");
  if (empty) empty.style.display = filtered.length ? "none" : "block";

  const featured = $("#featuredGames");
  if (featured) {
    featured.innerHTML = games.slice(0, 3).map(gameCard).join("");
  }
}

$("#gameSearch")?.addEventListener("input", renderGames);

$$("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    $$("[data-filter]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderGames();
  });
});

/* ---------- SCORE AND PROFILE ---------- */

function finishGame(score) {
  if (gameCompleted) return;

  gameCompleted = true;
  score = Math.max(0, Math.floor(Number(score) || 0));

  data.gamesPlayed++;
  data.totalScore += score;
  data.bestScore = Math.max(data.bestScore, score);

  if (activeGame) {
    data.scores[activeGame] =
      Math.max(data.scores[activeGame] || 0, score);
  }

  saveData();
  updateDashboard();
  renderGames();
  renderLeaderboard();
  renderProfile();

  beep(800);
}

function updateDashboard() {
  if ($("#gamesPlayed")) {
    $("#gamesPlayed").textContent = data.gamesPlayed;
  }

  if ($("#totalScore")) {
    $("#totalScore").textContent = data.totalScore;
  }

  if ($("#bestScore")) {
    $("#bestScore").textContent = data.bestScore;
  }

  if ($("#dailyStreak")) {
    $("#dailyStreak").textContent = data.dailyStreak;
  }

  renderAchievements();
}

function renderProfile() {
  const username = escapeHTML(data.username || "Player");

  if ($("#profileName")) $("#profileName").textContent = username;
  if ($("#navUsername")) $("#navUsername").textContent = username;

  if ($("#profileAvatar")) {
    $("#profileAvatar").textContent = username.charAt(0).toUpperCase();
  }

  if ($("#navAvatar")) {
    $("#navAvatar").textContent = username.charAt(0).toUpperCase();
  }

  if ($("#profileGames")) {
    $("#profileGames").textContent = data.gamesPlayed;
  }

  if ($("#profilePoints")) {
    $("#profilePoints").textContent = data.totalScore;
  }

  if ($("#usernameInput")) {
    $("#usernameInput").value = data.username;
  }
}

$("#profileForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const username = $("#usernameInput")?.value.trim();

  if (!username) return;

  data.username = username.slice(0, 20);
  saveData();
  renderProfile();

  alert("Profile updated successfully!");
});

function renderAchievements() {
  const container = $("#achievements");
  if (!container) return;

  const achievements = [
    {
      icon: "🎮",
      title: "First Game",
      description: "Play your first game",
      unlocked: data.gamesPlayed >= 1
    },
    {
      icon: "🏆",
      title: "Score Hunter",
      description: "Earn 100 total points",
      unlocked: data.totalScore >= 100
    },
    {
      icon: "🔥",
      title: "Getting Started",
      description: "Complete 5 games",
      unlocked: data.gamesPlayed >= 5
    },
    {
      icon: "⭐",
      title: "High Scorer",
      description: "Reach 50 points in one game",
      unlocked: data.bestScore >= 50
    }
  ];

  container.innerHTML = achievements.map(item => `
    <div class="achievement ${item.unlocked ? "unlocked" : "locked"}">
      <span>${item.icon}</span>
      <div>
        <h4>${item.title}</h4>
        <p>${item.description}</p>
      </div>
      <span>${item.unlocked ? "✓" : "🔒"}</span>
    </div>
  `).join("");
}

function renderLeaderboard() {
  const container = $("#leaderboardList");
  if (!container) return;

  const entries = [
    { name: "GameMaster", score: 450 },
    { name: "ProPlayer", score: 320 },
    { name: "NinjaGamer", score: 210 },
    { name: data.username, score: data.totalScore, current: true }
  ].sort((a, b) => b.score - a.score);

  container.innerHTML = entries.map((entry, index) => `
    <div class="leaderboard-item">
      <span>#${index + 1}</span>
      <strong>${escapeHTML(entry.name)} ${entry.current ? "(You)" : ""}</strong>
      <span>${entry.score} pts</span>
    </div>
  `).join("");
}

/* ---------- GAME SCREEN ---------- */

function openGame(id, startImmediately = false) {
  const game = games.find(item => item.id === id);
  if (!game) return;

  clearTimeout(gameTimer);

  activeGame = id;
  gameCompleted = false;

  $("#playingTitle").textContent = game.name;
  $("#guideText").textContent = game.guide;

  showPage("play");

  if (startImmediately) {
    startGame(id);
  } else {
    $("#gameArea").innerHTML = `
      <div class="game-start-screen">
        <div style="font-size:64px">${game.icon}</div>
        <h2>${game.name}</h2>
        <p>${game.guide}</p>
        <button class="game-play-btn" id="startGameBtn">
          Start Game
        </button>
      </div>
    `;

    $("#startGameBtn").addEventListener("click", () => startGame(id));
  }
}

document.addEventListener("click", event => {
  const playButton = event.target.closest("[data-play]");
  const guideButton = event.target.closest("[data-guide]");

  if (playButton) openGame(playButton.dataset.play, true);
  if (guideButton) openGame(guideButton.dataset.guide, false);
});

function startGame(id) {
  clearTimeout(gameTimer);
  activeGame = id;
  gameCompleted = false;

  const area = $("#gameArea");
  if (!area) return;

  const gameFunctions = {
    tictactoe: ticTacToe,
    rps: rockPaperScissors,
    number: numberGuess,
    memory: memoryMatch,
    math: quickMath,
    scramble: wordScramble,
    reaction: reactionTest,
    color: colorMatch,
    dice: diceDuel
  };

  if (gameFunctions[id]) gameFunctions[id]();
}

/* ---------- 1. TIC TAC TOE ---------- */

function ticTacToe() {
  const area = $("#gameArea");
  let board = Array(9).fill("");
  let gameOver = false;

  area.innerHTML = `
    <h2>Tic Tac Toe</h2>
    <p id="tttStatus">Your turn! You are X.</p>
    <div class="ttt-board" id="tttBoard"
      style="display:grid;grid-template-columns:repeat(3,85px);gap:8px;justify-content:center">
      ${board.map((_, i) => `
        <button data-cell="${i}"
          style="height:85px;font-size:32px;border-radius:12px">
        </button>
      `).join("")}
    </div>
    <button class="game-play-btn" id="tttReset">Restart</button>
  `;

  const boardElement = $("#tttBoard");
  const status = $("#tttStatus");

  function winner() {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];

    for (const [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return board.every(Boolean) ? "draw" : null;
  }

  function end(result) {
    gameOver = true;
    status.textContent =
      result === "X" ? "🎉 You win!" :
      result === "O" ? "Computer wins!" : "It's a draw!";

    finishGame(result === "X" ? 30 : result === "draw" ? 10 : 0);
  }

  function computerMove() {
    const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
    if (!empty.length || gameOver) return;

    const move = empty[Math.floor(Math.random() * empty.length)];
    board[move] = "O";
    update();

    const result = winner();
    if (result) end(result);
    else status.textContent = "Your turn!";
  }

  function update() {
    boardElement.querySelectorAll("[data-cell]").forEach(button => {
      button.textContent = board[Number(button.dataset.cell)];
      button.disabled = Boolean(board[Number(button.dataset.cell)]) || gameOver;
    });
  }

  boardElement.addEventListener("click", event => {
    const button = event.target.closest("[data-cell]");
    if (!button || gameOver) return;

    const index = Number(button.dataset.cell);
    if (board[index]) return;

    board[index] = "X";
    update();

    const result = winner();
    if (result) return end(result);

    status.textContent = "Computer's turn...";
    gameTimer = setTimeout(computerMove, 450);
  });

  $("#tttReset").addEventListener("click", ticTacToe);
}

/* ---------- 2. ROCK PAPER SCISSORS ---------- */

function rockPaperScissors() {
  const area = $("#gameArea");
  let playerScore = 0;
  let computerScore = 0;
  let rounds = 0;

  area.innerHTML = `
    <h2>Rock Paper Scissors</h2>
    <h3 id="rpsScore">You 0 - 0 Computer</h3>
    <p id="rpsResult">Choose your move!</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      ${["Rock", "Paper", "Scissors"].map((item, i) => `
        <button class="game-play-btn" data-rps="${item}">
          ${["✊", "✋", "✌️"][i]} ${item}
        </button>
      `).join("")}
    </div>
  `;

  area.querySelectorAll("[data-rps]").forEach(button => {
    button.addEventListener("click", () => {
      if (rounds >= 5) return;

      const player = button.dataset.rps;
      const choices = ["Rock", "Paper", "Scissors"];
      const computer = choices[Math.floor(Math.random() * 3)];

      let result = "Draw!";
      if (
        (player === "Rock" && computer === "Scissors") ||
        (player === "Paper" && computer === "Rock") ||
        (player === "Scissors" && computer === "Paper")
      ) {
        playerScore++;
        result = "You win this round!";
      } else if (player !== computer) {
        computerScore++;
        result = "Computer wins this round!";
      }

      rounds++;
      $("#rpsResult").textContent =
        `${player} vs ${computer} — ${result}`;

      $("#rpsScore").textContent =
        `You ${playerScore} - ${computerScore} Computer`;

      if (rounds === 5) {
        const points = playerScore > computerScore ? 30 :
          playerScore === computerScore ? 15 : 5;

        $("#rpsResult").textContent += ` Game over!`;
        finishGame(points);
      }

      beep(550);
    });
  });
}

/* ---------- 3. NUMBER GUESS ---------- */

function numberGuess() {
  const area = $("#gameArea");
  const target = Math.floor(Math.random() * 100) + 1;
  let attempts = 7;

  area.innerHTML = `
    <h2>Guess the Number</h2>
    <p>Choose a number between 1 and 100.</p>
    <input id="guessInput" type="number" min="1" max="100"
      placeholder="Your guess">
    <button class="game-play-btn" id="guessBtn">Guess</button>
    <h3 id="guessMessage">7 attempts remaining</h3>
  `;

  $("#guessBtn").addEventListener("click", () => {
    if (gameCompleted) return;

    const value = Number($("#guessInput").value);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      $("#guessMessage").textContent = "Enter a number from 1 to 100.";
      return;
    }

    attempts--;

    if (value === target) {
      $("#guessMessage").textContent = "🎉 Correct! You found the number!";
      finishGame(attempts * 5 + 15);
    } else if (attempts === 0) {
      $("#guessMessage").textContent = `Game over! Number was ${target}.`;
      finishGame(0);
    } else {
      $("#guessMessage").textContent =
        `${value < target ? "Go higher!" : "Go lower!"} ${attempts} attempts left.`;
    }

    $("#guessInput").value = "";
  });
}

/* ---------- 4. MEMORY MATCH ---------- */

function memoryMatch() {
  const area = $("#gameArea");
  const emojis = ["🍕", "🚀", "🐱", "⚽", "🎮", "🌈"];
  const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  let first = null;
  let second = null;
  let locked = false;
  let matched = 0;
  let moves = 0;

  area.innerHTML = `
    <h2>Memory Match</h2>
    <p id="memoryInfo">Moves: 0 | Pairs: 0/6</p>
    <div id="memoryBoard"
      style="display:grid;grid-template-columns:repeat(4,minmax(55px,75px));gap:9px;justify-content:center">
      ${cards.map((emoji, i) => `
        <button data-memory="${i}"
          style="height:70px;font-size:27px;border-radius:12px">
          ❔
        </button>
      `).join("")}
    </div>
  `;

  const buttons = area.querySelectorAll("[data-memory]");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      if (locked || button.disabled || button === first) return;

      const index = Number(button.dataset.memory);
      button.textContent = cards[index];
      button.disabled = true;

      if (!first) {
        first = button;
        return;
      }

      second = button;
      moves++;

      if (cards[Number(first.dataset.memory)] ===
          cards[Number(second.dataset.memory)]) {
        matched++;
        first = null;
        second = null;
        $("#memoryInfo").textContent =
          `Moves: ${moves} | Pairs: ${matched}/6`;

        if (matched === 6) finishGame(Math.max(10, 100 - moves * 5));
      } else {
        locked = true;

        gameTimer = setTimeout(() => {
          first.textContent = "❔";
          second.textContent = "❔";
          first.disabled = false;
          second.disabled = false;
          first = null;
          second = null;
          locked = false;
        }, 750);
      }
    });
  });
}

/* ---------- 5. QUICK MATH ---------- */

function quickMath() {
  const area = $("#gameArea");
  let round = 0;
  let score = 0;

  function nextQuestion() {
    if (round === 5) {
      area.innerHTML = `
        <h2>Quiz Complete!</h2>
        <h3>Your score: ${score}/5</h3>
        <p>Points earned: ${score * 20}</p>
      `;
      finishGame(score * 20);
      return;
    }

    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const operations = ["+", "-", "×"];
    const operation = operations[Math.floor(Math.random() * 3)];

    const answer = operation === "+" ? a + b :
      operation === "-" ? a - b : a * b;

    const options = new Set([answer]);
    while (options.size < 4) {
      options.add(answer + Math.floor(Math.random() * 15) - 7);
    }

    const shuffled = [...options].sort(() => Math.random() - 0.5);

    area.innerHTML = `
      <h2>Quick Math</h2>
      <p>Question ${round + 1} of 5</p>
      <h1>${a} ${operation} ${b} = ?</h1>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${shuffled.map(option => `
          <button class="game-play-btn" data-answer="${option}">
            ${option}
          </button>
        `).join("")}
      </div>
      <p>Correct answers: ${score}</p>
    `;

    area.querySelectorAll("[data-answer]").forEach(button => {
      button.addEventListener("click", () => {
        if (Number(button.dataset.answer) === answer) score++;
        round++;
        nextQuestion();
      });
    });
  }

  nextQuestion();
}

/* ---------- 6. WORD SCRAMBLE ---------- */

function wordScramble() {
  const area = $("#gameArea");
  const words = ["JAVASCRIPT", "GAMING", "COMPUTER", "BROWSER", "KEYBOARD", "PUZZLE"];
  const word = words[Math.floor(Math.random() * words.length)];

  let scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
  while (scrambled === word) {
    scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
  }

  let attempts = 3;

  area.innerHTML = `
    <h2>Word Scramble</h2>
    <h1 style="letter-spacing:8px">${scrambled}</h1>
    <input id="wordInput" placeholder="Enter the correct word">
    <button class="game-play-btn" id="wordBtn">Submit</button>
    <p id="wordMessage">3 attempts remaining</p>
  `;

  $("#wordBtn").addEventListener("click", () => {
    if (gameCompleted) return;

    const answer = $("#wordInput").value.trim().toUpperCase();

    if (!answer) return;

    if (answer === word) {
      $("#wordMessage").textContent = "🎉 Correct word!";
      finishGame(attempts * 10 + 10);
    } else {
      attempts--;

      if (attempts === 0) {
        $("#wordMessage").textContent = `Game over! Word: ${word}`;
        finishGame(0);
      } else {
        $("#wordMessage").textContent =
          `Wrong! ${attempts} attempts remaining.`;
      }
    }

    $("#wordInput").value = "";
  });
}

/* ---------- 7. REACTION TEST ---------- */

function reactionTest() {
  const area = $("#gameArea");
  let state = "waiting";
  let startTime = 0;

  area.innerHTML = `
    <h2>Reaction Test</h2>
    <p id="reactionMessage">Press Start when you're ready.</p>
    <button id="reactionButton" class="game-play-btn">
      Start Test
    </button>
  `;

  const button = $("#reactionButton");
  const message = $("#reactionMessage");

  button.addEventListener("click", () => {
    if (state === "waiting") {
      state = "ready";
      button.textContent = "Wait for green...";
      button.style.background = "#d97706";
      message.textContent = "Wait... don't click yet!";

      gameTimer = setTimeout(() => {
        state = "go";
        startTime = performance.now();
        button.textContent = "CLICK NOW!";
        button.style.background = "#16a34a";
        message.textContent = "GO! Click quickly!";
      }, 1500 + Math.random() * 3000);

    } else if (state === "ready") {
      clearTimeout(gameTimer);
      state = "waiting";
      button.textContent = "Try Again";
      button.style.background = "";
      message.textContent = "Too early! Wait for green.";

    } else if (state === "go") {
      const reaction = Math.round(performance.now() - startTime);
      state = "finished";

      message.textContent = `Your reaction time: ${reaction} ms`;
      button.textContent = "Play Again";
      button.style.background = "";

      finishGame(Math.max(5, Math.round(100 - reaction / 10)));
    } else {
      reactionTest();
    }
  });
}

/* ---------- 8. COLOR MATCH ---------- */

function colorMatch() {
  const area = $("#gameArea");

  const palette = [
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Purple", value: "#a855f7" },
    { name: "Orange", value: "#f97316" }
  ];

  let round = 0;
  let score = 0;

  function nextRound() {
    if (round === 5) {
      area.innerHTML = `
        <h2>Color Match Complete!</h2>
        <h3>You got ${score}/5 correct.</h3>
      `;
      finishGame(score * 20);
      return;
    }

    const target = palette[Math.floor(Math.random() * palette.length)];
    const choices = [target];

    while (choices.length < 4) {
      const choice = palette[Math.floor(Math.random() * palette.length)];
      if (!choices.some(item => item.name === choice.name)) {
        choices.push(choice);
      }
    }

    choices.sort(() => Math.random() - 0.5);

    area.innerHTML = `
      <h2>Color Match</h2>
      <p>Round ${round + 1} of 5</p>
      <p>Find this color:</p>
      <div style="width:100px;height:100px;border-radius:20px;margin:15px auto;background:${target.value}"></div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${choices.map(choice => `
          <button data-color="${choice.name}"
            class="game-play-btn">${choice.name}</button>
        `).join("")}
      </div>
    `;

    area.querySelectorAll("[data-color]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.color === target.name) score++;
        round++;
        nextRound();
      });
    });
  }

  nextRound();
}

/* ---------- 9. DICE DUEL ---------- */

function diceDuel() {
  const area = $("#gameArea");
  let round = 0;
  let playerScore = 0;
  let computerScore = 0;

  area.innerHTML = `
    <h2>Dice Duel</h2>
    <h3 id="diceScore">You 0 - 0 Computer</h3>
    <div style="display:flex;gap:35px;justify-content:center;font-size:45px;margin:25px">
      <div>You <div id="playerDice">🎲</div></div>
      <div>Computer <div id="computerDice">🎲</div></div>
    </div>
    <button id="rollDice" class="game-play-btn">Roll Dice</button>
    <p id="diceMessage">Play 5 rounds!</p>
  `;

  $("#rollDice").addEventListener("click", () => {
    if (round >= 5) return;

    const player = Math.floor(Math.random() * 6) + 1;
    const computer = Math.floor(Math.random() * 6) + 1;

    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

    $("#playerDice").textContent = faces[player - 1];
    $("#computerDice").textContent = faces[computer - 1];

    if (player > computer) playerScore++;
    else if (computer > player) computerScore++;

    round++;

    $("#diceScore").textContent =
      `You ${playerScore} - ${computerScore} Computer`;

    $("#diceMessage").textContent =
      player > computer ? "You win this round!" :
      player === computer ? "It's a draw!" : "Computer wins this round!";

    if (round === 5) {
      $("#diceMessage").textContent += " Match completed!";
      const points = playerScore > computerScore ? 30 :
        playerScore === computerScore ? 15 : 5;
      finishGame(points);
    }
  });
}

/* ---------- SOUND TOGGLE ---------- */

$("#soundToggle")?.addEventListener("change", event => {
  soundEnabled = event.target.checked;
  beep(600);
});

/* ---------- DAILY STREAK ---------- */

function updateDailyStreak() {
  const today = new Date().toDateString();

  if (data.lastPlayed !== today) {
    if (data.lastPlayed) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      data.dailyStreak = data.lastPlayed === yesterday.toDateString()
        ? data.dailyStreak + 1
        : 1;
    }

    data.lastPlayed = today;
    saveData();
  }
}

/* ---------- INITIALIZE ---------- */

function initializeApp() {
  updateDailyStreak();
  renderGames();
  updateDashboard();
  renderProfile();
  renderLeaderboard();

  if ($("#soundToggle")) {
    $("#soundToggle").checked = soundEnabled;
  }

  showPage("dashboard");
}

initializeApp();
