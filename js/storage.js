
// =====================================
// GAMEZONE - PLAYER DATA STORAGE
// Developed by Karan Dev
// =====================================

const defaultPlayerData = {
    username: "Player",
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,

    scores: {
        tictactoe: 0,
        rockpaperscissors: 0,
        numberguess: 0
    },

    dailyStreak: 0,
    lastPlayedDate: "",
    soundEnabled: true
};

// Get today's date in local YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Get yesterday's date
function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load player data
function getPlayerData() {
    const savedData = localStorage.getItem("gamezone_player");

    if (!savedData) {
        return { ...defaultPlayerData, scores: { ...defaultPlayerData.scores } };
    }

    try {
        const parsedData = JSON.parse(savedData);

        return {
            ...defaultPlayerData,
            ...parsedData,
            scores: {
                ...defaultPlayerData.scores,
                ...(parsedData.scores || {})
            }
        };
    } catch (error) {
        console.error("Unable to load player data:", error);

        return {
            ...defaultPlayerData,
            scores: { ...defaultPlayerData.scores }
        };
    }
}

// Save player data
function savePlayerData(data) {
    localStorage.setItem("gamezone_player", JSON.stringify(data));
}

// Update username
function updateUsername(username) {
    const player = getPlayerData();

    player.username = username.trim() || "Player";

    savePlayerData(player);
}

// Update daily streak when a game is played
function updateDailyStreak(player) {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    if (player.lastPlayedDate === today) {
        return;
    }

    if (player.lastPlayedDate === yesterday) {
        player.dailyStreak += 1;
    } else {
        player.dailyStreak = 1;
    }

    player.lastPlayedDate = today;
}

// Update game score
function updateGameScore(gameName, points) {
    const player = getPlayerData();

    const earnedPoints = Math.max(0, Number(points) || 0);

    player.gamesPlayed += 1;
    player.totalScore += earnedPoints;

    if (earnedPoints > player.bestScore) {
        player.bestScore = earnedPoints;
    }

    if (player.scores[gameName] !== undefined) {
        player.scores[gameName] += earnedPoints;
    }

    updateDailyStreak(player);

    savePlayerData(player);
}

// Getters
function getGamesPlayed() {
    return getPlayerData().gamesPlayed;
}

function getTotalScore() {
    return getPlayerData().totalScore;
}

function getBestScore() {
    return getPlayerData().bestScore;
}

function getDailyStreak() {
    return getPlayerData().dailyStreak;
}

// Sound settings
function getSoundEnabled() {
    return getPlayerData().soundEnabled;
}

function setSoundEnabled(enabled) {
    const player = getPlayerData();

    player.soundEnabled = Boolean(enabled);

    savePlayerData(player);
}

// Reset all player data
function resetPlayerData() {
    localStorage.removeItem("gamezone_player");
}
