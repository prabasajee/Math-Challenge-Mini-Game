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
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 5);
    leaderboardEl.innerHTML = leaderboard.map((s, i) => `<li>#${i+1}: ${s}</li>`).join('');
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
        feedbackEl.textContent = 'Correct!';
        playSound(true);
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = `High Score: ${highScore}`;
        }
        if (score % 10 === 0) {
            level++;
            levelEl.textContent = `Level: ${level}`;
        }
    } else {
        feedbackEl.textContent = `Wrong! The answer was ${currentAnswer}.`;
        playSound(false);
        score = Math.max(0, score - 1);
    }
    scoreEl.textContent = `Score: ${score}`;
    updateLeaderboard();
    setTimeout(generateQuestion, 1500);
}

typeSelect.addEventListener('change', function() {
    currentType = this.value;
    generateQuestion();
});

// Start the game
window.onload = function() {
    highScoreEl.textContent = `High Score: ${highScore}`;
    levelEl.textContent = `Level: ${level}`;
    generateQuestion();
};
