// login.js - unified login/signup logic with toggle
// login.js - unified login/signup logic with toggle
let authMode = 'login';
function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    document.getElementById('auth-title').textContent = authMode === 'login' ? '🔑 Login' : '📝 Sign Up';
    document.getElementById('auth-action').textContent = authMode === 'login' ? 'Login' : 'Sign Up';
    document.getElementById('toggle-auth').textContent = authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login";
    document.getElementById('auth-feedback').textContent = '';
}
function authAction() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const feedback = document.getElementById('auth-feedback');
    if (!username || !password) {
        feedback.textContent = 'Please enter username and password.';
        return;
    }
    let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
    if (authMode === 'login') {
        if (!users[username]) {
            feedback.textContent = 'User does not exist. Please sign up.';
            return;
        }
        if (users[username].password !== password) {
            feedback.textContent = 'Incorrect password.';
            return;
        }
        localStorage.setItem('mc_currentUser', username);
        feedback.textContent = '';
        showGameSection();
    } else {
        if (users[username]) {
            feedback.textContent = 'Username already exists. Please login.';
            return;
        }
        users[username] = { password, highScore: 0 };
        localStorage.setItem('mc_users', JSON.stringify(users));
        localStorage.setItem('mc_currentUser', username);
        feedback.textContent = '';
        showGameSection();
    }
}
function showGameSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('game-section').style.display = '';
    let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
    let username = localStorage.getItem('mc_currentUser');
    if (users[username]) {
        highScore = users[username].highScore || 0;
        highScoreEl.textContent = `High Score: ${highScore}`;
    }
    generateQuestion();
}
function logoutUser() {
    localStorage.removeItem('mc_currentUser');
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('auth-section').style.display = '';
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    toggleAuthMode();
}
window.onload = function() {
    highScoreEl.textContent = `High Score: ${highScore}`;
    levelEl.textContent = `Level: ${level}`;
    if (localStorage.getItem('mc_currentUser')) {
        showGameSection();
    } else {
        toggleAuthMode();
    }
};
