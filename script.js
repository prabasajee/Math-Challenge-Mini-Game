// Theme and avatar customization logic
function applyTheme(theme) {
    const root = document.documentElement;
    switch (theme) {
        case 'dark':
            root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        case 'blue':
            root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        case 'green':
            root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        default:
            root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            root.style.setProperty('--text-color', '#ffffff');
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
        el.innerHTML = `<strong>✅ Daily Challenge Complete!</strong> <span style='color:#ffd700;'>🏆</span>`;
        el.style.display = '';
    } else {
        el.innerHTML = `<strong>${challenge.question}</strong><br>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
            <input type='number' id='daily-answer' placeholder='?' style='width:80px; margin:0;' /> 
            <button onclick='submitDailyChallenge()' style='width:auto; padding:14px 24px;'>Submit</button>
        </div>
        <div id='daily-feedback' style='margin-top:8px; min-height:20px;'></div>`;
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
    
    // Update progress bars
    updateProgressBars();
}

function updateProgressBars() {
    // Level progress (0-10 questions per level)
    const levelProgress = (score % 10) * 10; // 0-100%
    document.getElementById('level-progress').style.width = levelProgress + '%';
    
    // Streak progress (cap at 15 for visual purposes)
    const streakProgress = Math.min(streak / 15 * 100, 100);
    document.getElementById('streak-progress').style.width = streakProgress + '%';
    document.getElementById('streak-count').textContent = streak;
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
    
    // Smart Timer - Harder questions get more time
    const baseTime = 8;
    const levelBonus = Math.min(level * 2, 12); // Cap at 20s total
    const typeBonus = {
        'addition': 0,
        'subtraction': 1,
        'multiplication': 2,
        'division': 3,
        'power': 4,
        'fraction': 5
    };
    timeLeft = baseTime + levelBonus + (typeBonus[currentType] || 0);
    timerEl.textContent = `Time left: ${timeLeft}s`;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    // Auto-focus answer input for better UX
    setTimeout(() => {
        document.getElementById('answer').focus();
    }, 100);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
        clearInterval(timer);
        // Enhanced feedback with explanation
        const explanation = getExplanation();
        feedbackEl.innerHTML = `⏰ <strong>Time's up!</strong><br><span style="color:var(--text-color);font-weight:600;">Answer: ${currentAnswer}</span><br><small style="color:var(--text-secondary);">${explanation}</small>`;
        playSound(false);
        score = Math.max(0, score - 1);
        streak = 0;
        scoreEl.textContent = `Score: ${score}`;
        updateLeaderboard();
        updateBadges();
        setTimeout(generateQuestion, 3000);
    }
}

// Helper function to explain answers
function getExplanation() {
    const parts = questionEl.textContent.split(' ');
    if (parts.length >= 3) {
        const a = parseFloat(parts[0]);
        const op = parts[1];
        const b = parseFloat(parts[2]);
        switch (op) {
            case '+': return `${a} plus ${b} equals ${a + b}`;
            case '-': return `${a} minus ${b} equals ${a - b}`;
            case '×': return `${a} times ${b} equals ${a * b}`;
            case '÷': return `${a} divided by ${b} equals ${(a / b).toFixed(2)}`;
            case '^': return `${a} to the power of ${b} equals ${Math.pow(a, b)}`;
            default: return 'Keep practicing to improve!';
        }
    }
    return 'Keep practicing to improve!';
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
        feedbackEl.innerHTML = `✅ <strong>Correct!</strong><br><small style="color:var(--success-color);">${getExplanation()}</small>`;
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
        feedbackEl.innerHTML = `❌ <strong>Wrong!</strong><br><span style="color:var(--text-color);font-weight:600;">Answer: ${currentAnswer}</span><br><small style="color:var(--text-secondary);">${getExplanation()}</small>`;
        playSound(false);
        score = Math.max(0, score - 1);
        streak = 0;
    }
    scoreEl.textContent = `Score: ${score}`;
    updateLeaderboard();
    updateBadges();
    setTimeout(() => {
        generateQuestion();
        // Auto-focus on answer input for better UX
        document.getElementById('answer').focus();
    }, 1500);
}

// Keyboard controls
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitAnswer();
    }
}

// Additional keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to focus on answer input (quick restart)
    if (event.key === 'Escape') {
        event.preventDefault();
        document.getElementById('answer').focus();
        document.getElementById('answer').select();
    }
    // Space bar to focus on submit button
    if (event.key === ' ' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        document.getElementById('submit-btn').focus();
    }
});

typeSelect.addEventListener('change', function() {
    currentType = this.value;
    streak = 0;
    updateBadges();
    generateQuestion();
    showDailyChallenge();
});
