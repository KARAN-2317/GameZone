
/* ==============================
   GAMEZONE - LEADERBOARD SYSTEM
================================ */

// Get Leaderboard Data
function getLeaderboardData() {

    const player = getPlayerData();

    // Current player leaderboard entry
    const leaderboard = [
        {
            name: player.username,
            score: player.totalScore
        }
    ];

    // Demo players
    const demoPlayers = [
        { name: "ShadowX", score: 850 },
        { name: "ProGamer", score: 720 },
        { name: "NinjaPlay", score: 590 },
        { name: "CyberKing", score: 450 }
    ];

    // Add demo players
    leaderboard.push(...demoPlayers);

    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);

    return leaderboard;
}

// Display Leaderboard
function displayLeaderboard() {

    const leaderboardList = document.getElementById("leaderboardList");

    if (!leaderboardList) return;

    const leaderboard = getLeaderboardData();

    leaderboardList.innerHTML = "";

    leaderboard.forEach((player, index) => {

        const item = document.createElement("div");

        item.className = "leaderboard-item";

        const rank = document.createElement("div");
        rank.className = "leaderboard-rank";
        rank.textContent = index === 0 ? "🥇" :
                           index === 1 ? "🥈" :
                           index === 2 ? "🥉" :
                           index + 1;

        const name = document.createElement("div");
        name.className = "leaderboard-player";
        name.textContent = player.name;

        const score = document.createElement("div");
        score.className = "leaderboard-score";
        score.textContent = player.score + " XP";

        item.append(rank, name, score);

        leaderboardList.appendChild(item);

    });
}
