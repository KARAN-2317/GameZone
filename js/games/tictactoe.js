
/* ==============================
   GAMEZONE - TIC TAC TOE
================================ */

let ticBoard = ["", "", "", "", "", "", "", "", ""];
let ticGameOver = false;

const ticWinningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Start Game
function startTicTacToe() {

    ticBoard = ["", "", "", "", "", "", "", "", ""];
    ticGameOver = false;

    const container = document.getElementById("gameContainer");

    container.innerHTML = `
        <div class="game-header">
            <h2>⭕ Tic Tac Toe</h2>
            <button class="back-btn" id="ticBack">← Back</button>
        </div>

        <div class="game-info">
            <div class="game-info-card">
                <p>Your Symbol</p>
                <h3>X</h3>
            </div>

            <div class="game-info-card">
                <p>Computer</p>
                <h3>O</h3>
            </div>
        </div>

        <p class="game-status" id="ticStatus">
            Your Turn! Choose a box.
        </p>

        <div class="tic-tac-toe-board" id="ticBoard">
            ${ticBoard.map((cell, index) => `
                <button class="tic-cell" data-index="${index}"></button>
            `).join("")}
        </div>

        <div style="text-align:center;">
            <button class="game-action-btn" id="ticRestart">
                ↻ Restart Game
            </button>
        </div>
    `;

    document.getElementById("ticBack").addEventListener("click", () => {
        showPage("games");
    });

    document.getElementById("ticRestart").addEventListener("click", () => {
        startTicTacToe();
    });

    document.querySelectorAll(".tic-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            playerMove(Number(cell.dataset.index));
        });
    });
}

// Player Move
function playerMove(index) {

    if (ticGameOver || ticBoard[index] !== "") return;

    ticBoard[index] = "X";

    updateTicBoard();

    if (checkTicWinner("X")) {
        finishTicGame("win");
        return;
    }

    if (ticBoard.every(cell => cell !== "")) {
        finishTicGame("draw");
        return;
    }

    document.getElementById("ticStatus").textContent =
        "Computer is thinking...";

    setTimeout(computerMove, 500);
}

// Computer Move
function computerMove() {

    if (ticGameOver) return;

    let move = findBestMove("O");

    if (move === -1) {
        move = findBestMove("X");
    }

    if (move === -1 && ticBoard[4] === "") {
        move = 4;
    }

    if (move === -1) {
        const available = ticBoard
            .map((cell, index) => cell === "" ? index : -1)
            .filter(index => index !== -1);

        if (available.length > 0) {
            move = available[Math.floor(Math.random() * available.length)];
        }
    }

    if (move === -1) return;

    ticBoard[move] = "O";

    updateTicBoard();

    if (checkTicWinner("O")) {
        finishTicGame("lose");
        return;
    }

    if (ticBoard.every(cell => cell !== "")) {
        finishTicGame("draw");
        return;
    }

    document.getElementById("ticStatus").textContent =
        "Your Turn! Choose a box.";
}

// Find Winning or Blocking Move
function findBestMove(symbol) {

    for (const pattern of ticWinningPatterns) {

        const values = pattern.map(index => ticBoard[index]);

        const symbolCount = values.filter(value => value === symbol).length;
        const emptyCount = values.filter(value => value === "").length;

        if (symbolCount === 2 && emptyCount === 1) {
            return pattern[values.indexOf("")];
        }
    }

    return -1;
}

// Update Board UI
function updateTicBoard() {

    document.querySelectorAll(".tic-cell").forEach((cell, index) => {

        cell.textContent = ticBoard[index];

        cell.classList.remove("x", "o");

        if (ticBoard[index] === "X") {
            cell.classList.add("x");
        }

        if (ticBoard[index] === "O") {
            cell.classList.add("o");
        }

    });
}

// Check Winner
function checkTicWinner(symbol) {

    return ticWinningPatterns.some(pattern => {
        return pattern.every(index => ticBoard[index] === symbol);
    });
}

// Finish Game
function finishTicGame(result) {

    ticGameOver = true;

    let message = "";
    let points = 0;

    if (result === "win") {
        message = "🎉 Congratulations! You Won!";
        points = 100;
    }

    else if (result === "lose") {
        message = "😢 Computer Won! Try Again.";
        points = 0;
    }

    else {
        message = "🤝 It's a Draw!";
        points = 20;
    }

    document.getElementById("ticStatus").textContent = message;

    // Save Result
    updateGameScore("tictactoe", points);
}
