
/* ==============================
   GAMEZONE - ROCK PAPER SCISSORS
================================ */

let rpsGameOver = false;

const rpsChoices = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// Start Game
function startRockPaperScissors() {

    rpsGameOver = false;

    const container = document.getElementById("gameContainer");

    container.innerHTML = `
        <div class="game-header">
            <h2>✊ Rock Paper Scissors</h2>
            <button class="back-btn" id="rpsBack">← Back</button>
        </div>

        <p class="game-status" id="rpsStatus">
            Choose your move!
        </p>

        <div class="rps-result">
            <div class="rps-player">
                <h3>You</h3>
                <div class="rps-choice" id="playerChoice">❔</div>
            </div>

            <div class="rps-vs">VS</div>

            <div class="rps-player">
                <h3>Computer</h3>
                <div class="rps-choice" id="computerChoice">❔</div>
            </div>
        </div>

        <h3 style="text-align:center;">Choose Your Weapon</h3>

        <div class="rps-options">
            <button class="rps-option" data-choice="rock">
                ✊
                <span>Rock</span>
            </button>

            <button class="rps-option" data-choice="paper">
                ✋
                <span>Paper</span>
            </button>

            <button class="rps-option" data-choice="scissors">
                ✌️
                <span>Scissors</span>
            </button>
        </div>

        <div style="text-align:center; margin-top:25px;">
            <button class="game-action-btn" id="rpsReset">
                ↻ Play Again
            </button>
        </div>

        <div class="game-info">
            <div class="game-info-card">
                <p>Win</p>
                <h3>+50 Points</h3>
            </div>

            <div class="game-info-card">
                <p>Draw</p>
                <h3>+10 Points</h3>
            </div>
        </div>
    `;

    document.getElementById("rpsBack").addEventListener("click", () => {
        showPage("games");
    });

    document.getElementById("rpsReset").addEventListener("click", () => {
        startRockPaperScissors();
    });

    document.querySelectorAll(".rps-option").forEach(button => {
        button.addEventListener("click", () => {
            playRPS(button.dataset.choice);
        });
    });
}

// Play Game
function playRPS(player) {

    if (rpsGameOver) return;

    const choices = ["rock", "paper", "scissors"];

    const computer = choices[
        Math.floor(Math.random() * choices.length)
    ];

    document.getElementById("playerChoice").textContent =
        rpsChoices[player];

    document.getElementById("computerChoice").textContent =
        rpsChoices[computer];

    let result = "";
    let points = 0;

    if (player === computer) {

        result = "🤝 It's a Draw!";
        points = 10;

    } else if (
        (player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper")
    ) {

        result = "🎉 You Won!";
        points = 50;

    } else {

        result = "😢 Computer Won!";
        points = 0;

    }

    document.getElementById("rpsStatus").textContent = result;

    // Save Score
    updateGameScore("rockpaperscissors", points);

    rpsGameOver = true;
}
