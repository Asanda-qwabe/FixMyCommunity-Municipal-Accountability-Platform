// SCREEN NAVIGATION
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    if (id === "home") loadIssues();
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
    loadIssues();

    const form = document.getElementById("issue-form");
    if (form) {
        form.addEventListener("submit", submitIssue);
    }
});