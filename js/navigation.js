
/* ==============================
   GAMEZONE - NAVIGATION SYSTEM
================================ */

// Page Titles
const pageTitles = {
    home: "Dashboard",
    games: "Games Library",
    gameplay: "Play Game",
    leaderboard: "Leaderboard",
    profile: "My Profile",
    about: "About GameZone"
};

// Switch Between Pages
function showPage(pageId) {

    // Hide all pages
    document.querySelectorAll(".page-section").forEach(page => {
        page.classList.remove("active");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) {
        console.error("Page not found:", pageId);
        return;
    }

    selectedPage.classList.add("active");

    // Update Navbar Title
    const title = document.getElementById("pageTitle");

    if (title) {
        title.textContent = pageTitles[pageId] || "GameZone";
    }

    // Update Active Sidebar Link
    document.querySelectorAll(".menu-link").forEach(link => {
        link.classList.remove("active");

        if (link.dataset.page === pageId) {
            link.classList.add("active");
        }
    });

    // Close Mobile Sidebar
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    // Update URL Hash
    history.replaceState(null, "", "#" + pageId);
}

// Open Game
function openGame(gameName) {

    showPage("gameplay");

    const gameContainer = document.getElementById("gameContainer");

    if (gameContainer) {
        gameContainer.innerHTML = "<p class='game-status'>Loading Game...</p>";
    }

    // Start selected game
    if (gameName === "tictactoe" &&
        typeof startTicTacToe === "function") {
        startTicTacToe();
    }

    else if (gameName === "rockpaperscissors" &&
        typeof startRockPaperScissors === "function") {
        startRockPaperScissors();
    }

    else if (gameName === "numberguess" &&
        typeof startNumberGuess === "function") {
        startNumberGuess();
    }

    else {
        console.error("Game not found:", gameName);
    }
}

// Navigation Event Listeners
document.addEventListener("DOMContentLoaded", () => {

    // Sidebar Navigation
    document.querySelectorAll(".menu-link").forEach(link => {

        link.addEventListener("click", event => {
            event.preventDefault();

            const pageId = link.dataset.page;

            if (pageId) {
                showPage(pageId);
            }
        });

    });

    // Buttons with data-navigate
    document.querySelectorAll("[data-navigate]").forEach(button => {

        button.addEventListener("click", () => {
            showPage(button.dataset.navigate);
        });

    });

    // Buttons with data-game
    document.querySelectorAll("[data-game]").forEach(button => {

        button.addEventListener("click", () => {
            openGame(button.dataset.game);
        });

    });

    // Mobile Sidebar Toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });

    }

});
