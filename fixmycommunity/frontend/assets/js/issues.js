let issues = [];
let currentFilter = "all";

// LOAD issues from backend
async function loadIssues() {
    issues = await fetchIssues();
    renderIssues();
}

// FILTER
function filterIssues(category) {
    currentFilter = category;
    renderIssues();
}

// RENDER
function renderIssues() {
    const container = document.getElementById("issues-container");

    const filtered = currentFilter === "all"
        ? issues
        : issues.filter(i => i.category === currentFilter);

    container.innerHTML = filtered.map(issue => `
        <div class="issue-card">
            <div class="issue-content">
                <h3>${issue.title}</h3>
                <p>${issue.location}</p>
                <span>${issue.status}</span>
            </div>
        </div>
    `).join("");
}

// CREATE ISSUE
async function submitIssue(e) {
    e.preventDefault();

    const data = {
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        category: "other"
    };

    await createIssue(data);

    alert("Reported!");
    loadIssues();
}