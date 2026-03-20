const API_BASE = "http://localhost:8000/api";

// GET all issues
async function fetchIssues() {
    const res = await fetch(`${API_BASE}/issues`);
    return await res.json();
}

// CREATE issue
async function createIssue(data) {
    const res = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return await res.json();
}

// UPDATE issue
async function updateIssue(id, data) {
    const res = await fetch(`${API_BASE}/issues/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return await res.json();
}