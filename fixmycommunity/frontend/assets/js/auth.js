let currentUser = null;

function login(user) {
    currentUser = user;
}

function logout() {
    currentUser = null;
}