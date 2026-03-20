const API_BASE = "http://localhost:8000/api";
let allIssues = [];
let teams = [];

const showScreen = (id) => {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadCategories() {
  const data = await fetchJSON(`${API_BASE}/categories`);
  const select = document.getElementById("category");
  const filters = document.getElementById("category-filters");
  select.innerHTML = data.categories.map((c) => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
  filters.innerHTML = ['<button class="btn" data-category="all">All</button>']
    .concat(data.categories.map((c) => `<button class="btn" data-category="${c.id}">${c.icon} ${c.name}</button>`)).join("");
}

async function loadIssues(category = "all") {
  const query = category === "all" ? "" : `?category=${category}`;
  allIssues = await fetchJSON(`${API_BASE}/issues${query}`);
  renderIssueCards("issues-container", allIssues);
  renderIssueCards("user-reports", allIssues);
  renderAdminIssues();
}

function renderIssueCards(targetId, issues) {
  document.getElementById(targetId).innerHTML = issues.map((i) => `
    <article class="issue-card">
      <h3>${i.title}</h3>
      <p>${i.description}</p>
      <small>${i.location} • ${i.ward}</small><br>
      <small>Status: ${i.status} • Upvotes: ${i.upvotes}</small>
      <div class="filters">
        <button class="btn" onclick="upvoteIssue(${i.id})">Upvote</button>
      </div>
    </article>`).join("");
}

async function renderAdminIssues() {
  const rows = allIssues.map((i) => `
    <article class="issue-card">
      <h3>${i.title}</h3>
      <p>Status: ${i.status}</p>
      <select onchange="assignIssue(${i.id}, Number(this.value))">
        <option value="">Assign team</option>
        ${teams.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}
      </select>
      <select onchange="updateStatus(${i.id}, this.value)">
        <option value="">Update status</option>
        <option value="reported">Reported</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="fixed">Fixed</option>
      </select>
    </article>`).join("");
  document.getElementById("admin-reports").innerHTML = rows;
}

async function upvoteIssue(id) {
  await fetchJSON(`${API_BASE}/issues/${id}/upvote`, { method: "POST" });
  loadIssues();
}

async function assignIssue(id, teamId) {
  if (!teamId) return;
  await fetchJSON(`${API_BASE}/issues/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_id: teamId }),
  });
  loadIssues();
}

async function updateStatus(id, status) {
  if (!status) return;
  await fetchJSON(`${API_BASE}/issues/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  loadIssues();
}

async function loadAnnouncements() {
  const items = await fetchJSON(`${API_BASE}/announcements`);
  document.getElementById("announcements").innerHTML = items.map((a) => `
    <article class="issue-card">
      <h3>${a.title}</h3><p>${a.content}</p><small>${a.ward}</small>
    </article>`).join("");
}

async function loadStats() {
  const stats = await fetchJSON(`${API_BASE}/stats`);
  document.getElementById("stats").innerHTML = Object.entries(stats).map(([k,v]) => `
    <article class="stat-card"><strong>${k.replaceAll("_", " ")}</strong><div>${typeof v === "object" ? JSON.stringify(v) : v}</div></article>`).join("");
}

async function submitIssue(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    location: document.getElementById("location").value,
    ward: document.getElementById("ward").value,
    anonymous: document.getElementById("anonymous").checked,
  };
  await fetchJSON(`${API_BASE}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  e.target.reset();
  showScreen("home");
  loadIssues();
  loadStats();
}

async function bootstrap() {
  await loadCategories();
  teams = await fetchJSON(`${API_BASE}/teams`).catch(() => []);
  await Promise.all([loadIssues(), loadAnnouncements(), loadStats()]);
}

document.addEventListener("click", async (e) => {
  const screen = e.target?.dataset?.screen;
  if (screen) {
    e.preventDefault();
    showScreen(screen);
  }
  const category = e.target?.dataset?.category;
  if (category) loadIssues(category);
  const service = e.target?.dataset?.service;
  if (service) {
    const location = prompt(`Enter location for ${service} emergency request:`);
    if (location) {
      const res = await fetchJSON(`${API_BASE}/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_type: service, location }),
      });
      alert(`Emergency submitted: ${res.reference_id}`);
    }
  }
});

document.getElementById("report-btn").addEventListener("click", () => showScreen("report-form"));
document.getElementById("issue-form").addEventListener("submit", submitIssue);
document.addEventListener("DOMContentLoaded", bootstrap);
