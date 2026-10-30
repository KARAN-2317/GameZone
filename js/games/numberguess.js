
/* ==============================
   GAMEZONE - NUMBER GUESSING
================================ */

let secretNumber;
let guessAttempts;
let maxAttempts = 7;
let numberGameOver = false;

// Start Game
function startNumberGuess() {

    secretNumber = Math.floor(Math.random() * 100) + 1;
    guessAttempts = 0;
    numberGameOver = false;

    const container = document.getElementById("gameContainer");

    container.innerHTML = `
        <div class="game-header">
            <h2>🔢 Number Guessing</h2>
            <button class="back-btn" id="numberBack">← Back</button>
        </div>

        <div class="game-info">
            <div class="game-info-card">
                <p>Number Range</p>
                <h3>1 - 100</h3>
            </div>

            <div class="game-info-card">
                <p>Attempts Left</p>
                <h3 id="attemptsLeft">${maxAttempts}</h3>
            </div>
        </div>

        <p class="game-status" id="numberStatus">
            I have selected a number. Can you guess it?
        </p>

        <div class="number-guess-area">
            <input
                type="number"
                id="numberInput"
                min="1"
                max="100"
                placeholder="Enter a number..."
            >

            <button class="game-action-btn" id="guessButton">
                Guess Number
            </button>
        </div>

        <div class="content-card" style="text-align:center; margin-top:20px;">
            <h3>💡 How to Play</h3>
            <p>Guess the secret number between 1 and 100.</p>
            <p>I'll tell you if your guess is too high or too low.</p>
            <p>You have ${maxAttempts} attempts to find the number!</p>
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="game-action-btn" id="numberRestart">
                ↻ New Game
            </button>
        </div>
    `;

    document.getElementById("numberBack").addEventListener("click", () => {
        showPage("games");
    });

    document.getElementById("guessButton").addEventListener("click", checkGuess);

    document.getElementById("numberRestart").addEventListener("click", () => {
        startNumberGuess();
    });

    document.getElementById("numberInput").addEventListener("keydown", event => {
        if (event.key === "Enter") {
            checkGuess();
        }
    });

}

// Check Player Guess
function checkGuess() {

    if (numberGameOver) return;

    const input = document.getElementById("numberInput");
    const guess = Number(input.value);
    const status = document.getElementById("numberStatus");

    if (!input.value || guess < 1 || guess > 100) {
        status.textContent = "⚠️ Please enter a number between 1 and 100.";
        return;
    }

    guessAttempts++;

    document.getElementById("attemptsLeft").textContent =
        maxAttempts - guessAttempts;

    if (guess === secretNumber) {

        const points = (maxAttempts - guessAttempts + 1) * 20;

        status.textContent =
            `🎉 Correct! You guessed the number in ${guessAttempts} attempts!`;

        finishNumberGame(points);

    } else if (guess < secretNumber) {

        status.textContent = "📈 Too Low! Try a higher number.";

    } else {

        status.textContent = "📉 Too High! Try a lower number.";

    }

    if (guessAttempts >= maxAttempts && !numberGameOver) {

        status.textContent =
            `😢 Game Over! The correct number was ${secretNumber}.`;

        finishNumberGame(0);

    }

    input.value = "";

    if (!numberGameOver) {
        input.focus();
    }

}

// Finish Game
function finishNumberGame(points) {

    numberGameOver = true;

    document.getElementById("numberInput").disabled = true;
    document.getElementById("guessButton").disabled = true;

    updateGameScore("numberguess", points);

}
