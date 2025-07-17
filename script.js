// Theme and avatar customization logic
function applyTheme(theme) {
    const body = document.body;
    switch (theme) {
        case 'dark':
            body.style.background = '#222';
            body.style.color = '#eee';
            break;
        case 'blue':
            body.style.background = 'linear-gradient(135deg,#e3f2fd 0%,#90caf9 100%)';
            body.style.color = '#1a237e';
            break;
        case 'green':
            body.style.background = 'linear-gradient(135deg,#e8f5e9 0%,#66bb6a 100%)';
            body.style.color = '#1b5e20';
            break;
        default:
            body.style.background = 'linear-gradient(135deg,#e7f0fd 0%,#f7f7f7 100%)';
            body.style.color = '';
    }
}
function applyAvatar(avatar) {
    document.getElementById('avatar-display').textContent = avatar;
}
document.getElementById('theme-select').addEventListener('change', function() {
    applyTheme(this.value);
    localStorage.setItem('mc_theme', this.value);
});
document.getElementById('avatar-select').addEventListener('change', function() {
    applyAvatar(this.value);
    localStorage.setItem('mc_avatar', this.value);
});
    // Load theme and avatar from localStorage
    const theme = localStorage.getItem('mc_theme') || 'default';
    const avatar = localStorage.getItem('mc_avatar') || '😀';
    document.getElementById('theme-select').value = theme;
    document.getElementById('avatar-select').value = avatar;
    applyTheme(theme);
    applyAvatar(avatar);
// Daily challenge logic
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
}
function generateDailyChallenge() {
    // Simple: always addition, numbers based on date
    const today = new Date();
    const a = today.getDate() + 10;
    const b = today.getMonth() + 5;
    const answer = a + b;
    return { question: `Daily Challenge: ${a} + ${b} = ?`, answer };
}
function showDailyChallenge() {
    const key = getTodayKey();
    const completed = localStorage.getItem('mc_daily_' + key);
    const challenge = generateDailyChallenge();
    const el = document.getElementById('daily-challenge');
    if (completed) {
        el.innerHTML = `<strong>✅ Daily Challenge Complete!</strong> <span style='color:#2d7be5;'>🏆</span>`;
        el.style.display = '';
    } else {
        el.innerHTML = `<strong>${challenge.question}</strong><br><input type='number' id='daily-answer' style='margin:8px 0;padding:6px;border-radius:6px;border:1px solid #cfd8dc;width:80px;text-align:center;' placeholder='Answer' /> <button onclick='submitDailyChallenge()' style='padding:6px 16px;background:#2d7be5;color:#fff;border:none;border-radius:6px;cursor:pointer;'>Submit</button> <span id='daily-feedback' style='margin-left:8px;color:#e52d2d;'></span>`;
        el.style.display = '';
    }
}
function submitDailyChallenge() {
    const key = getTodayKey();
    const challenge = generateDailyChallenge();
    const userAnswer = Number(document.getElementById('daily-answer').value);
    const feedback = document.getElementById('daily-feedback');
    if (userAnswer === challenge.answer) {
        localStorage.setItem('mc_daily_' + key, 'done');
        feedback.textContent = 'Correct!';
        setTimeout(() => showDailyChallenge(), 1000);
        // Add badge
        document.getElementById('badges').innerHTML += ' <span title="Daily Challenge">🏆</span>';
    } else {
        feedback.textContent = 'Try again!';
    }
}
// Achievements/badges logic
let streak = 0;
function updateBadges() {
    let badges = [];
    if (score >= 10) badges.push('🏅 10 Points');
    if (score >= 25) badges.push('🎖️ 25 Points');
    if (score >= 50) badges.push('🥇 50 Points');
    if (streak >= 5) badges.push('🔥 5 Correct Streak');
    if (streak >= 10) badges.push('⚡ 10 Correct Streak');
    document.getElementById('badges').innerHTML = badges.length ? badges.join(' &nbsp; ') : '<span style="color:#aaa;">No badges yet</span>';
}

let score = 0;
let highScore = 0;
let level = 1;
let timer;
let timeLeft = 10;
let currentAnswer = 0;
let currentType = 'addition';
let leaderboard = [];

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highscore');
const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');
const leaderboardEl = document.getElementById('leaderboard-list');
const typeSelect = document.getElementById('type-select');

function playSound(correct) {
    const audio = new Audio(correct ? 'assets/correct.mp3' : 'assets/wrong.mp3');
    audio.play();
}

function updateLeaderboard() {
    // Global leaderboard: get top 5 scores from all users
    let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
    let scores = Object.entries(users).map(([user, data]) => ({ user, score: data.highScore || 0 }));
    scores.sort((a, b) => b.score - a.score);
    let topScores = scores.slice(0, 5);
    leaderboardEl.innerHTML = topScores.map((entry, i) => {
        let trophy = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        let highlight = i === 0 ? 'style="background:#ffe082;color:#1a2a3a;font-weight:700;"' : '';
        return `<li ${highlight}>${trophy} #${i+1}: <strong>${entry.user}</strong> - ${entry.score}</li>`;
    }).join('');
}

function generateQuestion() {
    let a, b, op, questionText;
    switch (currentType) {
        case 'addition':
            a = Math.floor(Math.random() * 10 * level) + 1;
            b = Math.floor(Math.random() * 10 * level) + 1;
            currentAnswer = a + b;
            questionText = `${a} + ${b}`;
            break;
        case 'subtraction':
            a = Math.floor(Math.random() * 10 * level) + 1;
            b = Math.floor(Math.random() * 10 * level) + 1;
            currentAnswer = a - b;
            questionText = `${a} - ${b}`;
            break;
        case 'multiplication':
            a = Math.floor(Math.random() * 10 * level) + 1;
            b = Math.floor(Math.random() * 10 * level) + 1;
            currentAnswer = a * b;
            questionText = `${a} × ${b}`;
            break;
        case 'division':
            b = Math.floor(Math.random() * 9 * level) + 2;
            currentAnswer = Math.floor(Math.random() * 10 * level) + 1;
            a = currentAnswer * b;
            questionText = `${a} ÷ ${b}`;
            break;
        case 'power':
            a = Math.floor(Math.random() * 5 * level) + 2;
            b = Math.floor(Math.random() * 2) + 2;
            currentAnswer = Math.pow(a, b);
            questionText = `${a} ^ ${b}`;
            break;
        case 'fraction':
            a = Math.floor(Math.random() * 10 * level) + 1;
            b = Math.floor(Math.random() * 9 * level) + 2;
            currentAnswer = (a / b).toFixed(2);
            questionText = `${a} / ${b} (2 decimal places)`;
            break;
    }
    questionEl.textContent = questionText;
    answerEl.value = '';
    feedbackEl.textContent = '';
    timeLeft = 10;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
        clearInterval(timer);
        feedbackEl.textContent = `Time's up! The answer was ${currentAnswer}.`;
        playSound(false);
        score = Math.max(0, score - 1);
        scoreEl.textContent = `Score: ${score}`;
        updateLeaderboard();
        setTimeout(generateQuestion, 1500);
    }
}

function submitAnswer() {
    let userAnswer = answerEl.value;
    if (currentType === 'fraction') {
        userAnswer = parseFloat(userAnswer).toFixed(2);
    } else {
        userAnswer = Number(userAnswer);
    }
    clearInterval(timer);
    if (userAnswer == currentAnswer) {
        score++;
        streak++;
        feedbackEl.textContent = 'Correct!';
        playSound(true);
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = `High Score: ${highScore}`;
            // Save high score for user
            let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
            let username = localStorage.getItem('mc_currentUser');
            if (users[username]) {
                users[username].highScore = highScore;
                localStorage.setItem('mc_users', JSON.stringify(users));
            }
        }
        if (score % 10 === 0) {
            level++;
            levelEl.textContent = `Level: ${level}`;
        }
    } else {
        feedbackEl.textContent = `Wrong! The answer was ${currentAnswer}.`;
        playSound(false);
        score = Math.max(0, score - 1);
        streak = 0;
    }
    scoreEl.textContent = `Score: ${score}`;
    updateLeaderboard();
    updateBadges();
    setTimeout(generateQuestion, 1500);
}
typeSelect.addEventListener('change', function() {
    currentType = this.value;
    streak = 0;
    updateBadges();
    generateQuestion();
    showDailyChallenge();
});
