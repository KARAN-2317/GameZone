
/* =========================================
   GAMEZONE - MAIN JAVASCRIPT
   Developed by Karan Dev
========================================= */

// =========================================
// 1. GAMES DATA
// =========================================

const gameList = [
    {
        id: "tictactoe",
        name: "Tic Tac Toe",
        description: "Test your strategy and beat the computer.",
        icon: "⭕",
        className: "tic-image"
    },
    {
        id: "rockpaperscissors",
        name: "Rock Paper Scissors",
        description: "Choose your move and defeat the computer.",
        icon: "✊",
        className: "rps-image"
    },
    {
        id: "numberguess",
        name: "Number Guessing",
        description: "Guess the secret number and win points.",
        icon: "🔢",
        className: "guess-image"
    }
];

// =========================================
// 2. DISPLAY GAMES
// =========================================

function displayGames(searchTerm = "") {

    const gamesGrid = document.getElementById("allGamesGrid");

    if (!gamesGrid) return;

    const filteredGames = gameList.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    gamesGrid.innerHTML = "";

    if (filteredGames.length === 0) {

        gamesGrid.innerHTML = `
            <div class="content-card">
                <h3>No Games Found 😕</h3>
                <p>Try searching with another name.</p>
            </div>
        `;

        return;
    }

    filteredGames.forEach(game => {

        const card = document.createElement("div");

        card.className = "game-card";

        card.innerHTML = `
            <div class="game-image ${game.className}">
                <span>${game.icon}</span>
            </div>

            <div class="game-details">
                <h3>${game.name}</h3>

                <p>${game.description}</p>

                <button class="game-btn" type="button">
                    Play Now →
                </button>
            </div>
        `;

        // PLAY BUTTON CLICK EVENT
        const playButton = card.querySelector(".game-btn");

        playButton.addEventListener("click", () => {

            if (typeof window.openGame === "function") {

                window.openGame(game.id);

            } else {

                console.error("openGame() function not found!");

                alert("Game load nahi ho paya. Please refresh the page.");

            }

        });

        gamesGrid.appendChild(card);

    });
}

// =========================================
// 3. PROFILE UPDATE
// =========================================

function updateProfile() {

    if (typeof getPlayerData !== "function") return;

    const player = getPlayerData();

    const navUsername = document.getElementById("navUsername");
    const profileUsername = document.getElementById("profileUsername");
    const usernameInput = document.getElementById("usernameInput");

    if (navUsername) {
        navUsername.textContent = player.username;
    }

    if (profileUsername) {
        profileUsername.textContent = player.username;
    }

    if (
        usernameInput &&
        document.activeElement !== usernameInput
    ) {
        usernameInput.value = player.username;
    }

    const avatar = player.username
        ? player.username.charAt(0).toUpperCase()
        : "P";

    document.querySelectorAll(
        ".player-avatar, .profile-avatar"
    ).forEach(element => {

        element.textContent = avatar;

    });
}

// =========================================
// 4. DAILY STREAK
// =========================================

function initializeDailyStreak() {

    const today = new Date().toDateString();

    const yesterday = new Date(
        Date.now() - 86400000
    ).toDateString();

    let lastVisit = localStorage.getItem("gamezone_last_visit");

    let streak = Number(
        localStorage.getItem("gamezone_daily_streak") || 0
    );

    if (lastVisit !== today) {

        if (lastVisit === yesterday) {

            streak++;

        } else {

            streak = 1;

        }

        localStorage.setItem(
            "gamezone_daily_streak",
            streak
        );

        localStorage.setItem(
            "gamezone_last_visit",
            today
        );

    }

    return streak;
}

function updateStreak() {

    const streakElement = document.getElementById("dailyStreak");

    if (streakElement) {

        streakElement.textContent = initializeDailyStreak();

    }

}

// =========================================
// 5. ACHIEVEMENTS
// =========================================

function updateAchievements() {

    if (typeof getPlayerData !== "function") return;

    const player = getPlayerData();

    const achievements = [
        {
            title: "First Game",
            description: "Play your first game.",
            icon: "🎮",
            unlocked: player.gamesPlayed >= 1
        },
        {
            title: "Score Hunter",
            description: "Earn 100 total points.",
            icon: "⭐",
            unlocked: player.totalScore >= 100
        },
        {
            title: "Champion",
            description: "Play 10 games.",
            icon: "🏆",
            unlocked: player.gamesPlayed >= 10
        }
    ];

    const achievementCards = document.querySelectorAll(
        ".achievement-card"
    );

    achievementCards.forEach((card, index) => {

        const achievement = achievements[index];

        if (!achievement) return;

        card.innerHTML = `
            <span>
                ${achievement.unlocked ? achievement.icon : "🔒"}
            </span>

            <h3>${achievement.title}</h3>

            <p>
                ${
                    achievement.unlocked
                        ? "Achievement unlocked!"
                        : achievement.description
                }
            </p>
        `;

        card.classList.toggle(
            "unlocked",
            achievement.unlocked
        );

    });

}

// =========================================
// 6. DASHBOARD UPDATE
// =========================================

function updateDashboard() {

    if (typeof getPlayerData !== "function") return;

    const player = getPlayerData();

    const gamesPlayed = document.getElementById("gamesPlayed");
    const totalScore = document.getElementById("totalScore");
    const bestScore = document.getElementById("bestScore");
    const totalGames = document.getElementById("totalGames");

    if (gamesPlayed) {
        gamesPlayed.textContent = player.gamesPlayed;
    }

    if (totalScore) {
        totalScore.textContent = player.totalScore;
    }

    if (bestScore) {
        bestScore.textContent = player.bestScore;
    }

    if (totalGames) {
        totalGames.textContent = gameList.length;
    }

    updateProfile();
    updateAchievements();
    updateStreak();

}

// =========================================
// 7. USERNAME SAVE
// =========================================

function setupProfileForm() {

    const saveButton = document.getElementById("saveUsername");

    const usernameInput = document.getElementById("usernameInput");

    if (!saveButton || !usernameInput) return;

    saveButton.addEventListener("click", () => {

        const username = usernameInput.value.trim();

        if (!username) {

            alert("Please enter a username!");

            return;

        }

        if (typeof updateUsername === "function") {

            updateUsername(username);

            updateProfile();

            alert("Profile updated successfully!");

        }

    });

}

// =========================================
// 8. GAME SEARCH
// =========================================

function setupGameSearch() {

    const searchInput = document.getElementById("gameSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {

        displayGames(searchInput.value.trim());

    });

}

// =========================================
// 9. SOUND SETTINGS
// =========================================

function getSoundEnabled() {

    return localStorage.getItem("gamezone_sound") !== "false";

}

function setSoundEnabled(enabled) {

    localStorage.setItem(
        "gamezone_sound",
        String(enabled)
    );

}

function setupSoundToggle() {

    const soundToggle = document.getElementById("soundToggle");

    if (!soundToggle) return;

    function refreshSoundButton() {

        const enabled = getSoundEnabled();

        soundToggle.textContent = enabled
            ? "🔊 Sound"
            : "🔇 Muted";

        soundToggle.setAttribute(
            "aria-pressed",
            String(enabled)
        );

    }

    refreshSoundButton();

    soundToggle.addEventListener("click", () => {

        setSoundEnabled(!getSoundEnabled());

        refreshSoundButton();

    });

}

// =========================================
// 10. REFRESH SCORE AFTER GAME
// =========================================

const originalUpdateGameScore = window.updateGameScore;

if (
    typeof originalUpdateGameScore === "function" &&
    !window.gamezoneScoreWrapped
) {

    window.updateGameScore = function(gameName, points) {

        originalUpdateGameScore(gameName, points);

        updateDashboard();

        if (typeof displayLeaderboard === "function") {

            displayLeaderboard();

        }

    };

    window.gamezoneScoreWrapped = true;

}

// =========================================
// 11. APPLICATION INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("GameZone initialized successfully!");

    displayGames();

    updateDashboard();

    setupProfileForm();

    setupGameSearch();

    setupSoundToggle();

    if (typeof displayLeaderboard === "function") {

        displayLeaderboard();

    }

});
