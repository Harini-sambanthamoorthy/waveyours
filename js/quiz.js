const questions = [
    {
        q: "What is the typical frequency range for Terrestrial Microwave transmission?",
        options: {
            a: "100 MHz - 500 MHz",
            b: "4 GHz - 23 GHz",
            c: "300 GHz - 400 THz",
            d: "1 THz - 10 THz"
        },
        correct: "b",
        feedback: "Correct! Terrestrial microwaves typically operate in the 4-6 GHz and 21-23 GHz bands."
    },
    {
        q: "Which characteristic makes Infrared ideal for secure indoor communication?",
        options: {
            a: "It can pass through concrete walls",
            b: "It is unaffected by sunlight",
            c: "It cannot penetrate walls",
            d: "It has low bandwidth"
        },
        correct: "c",
        feedback: "Exactly. IR is confined to a single room because it cannot penetrate opaque walls, preventing eavesdropping."
    },
    {
        q: "What is the typical operational life of a communication satellite before replacement is needed?",
        options: {
            a: "50-60 years",
            b: "1-2 years",
            c: "12-15 years",
            d: "5-10 years"
        },
        correct: "c",
        feedback: "Right. Satellites generally have a mission life of 12-15 years due to fuel and component degradation."
    },
    {
        q: "In Microwave transmission, what does 'Line-of-Sight' (LoS) imply?",
        options: {
            a: "Antennas must be connected by a wire",
            b: "Antennas must have a clear, unobstructed path between them",
            c: "The signal follows the curvature of the earth automatically",
            d: "The transmission only works underwater"
        },
        correct: "b",
        feedback: "Correct. Microwaves don't easily diffract around large obstacles, requiring a clear sight path."
    },
    {
        q: "What is the maximum typical bandwidth supported by Terrestrial Microwave links?",
        options: {
            a: "1 Gbps",
            b: "10 Mbps",
            c: "100 Kbps",
            d: "100 Gbps"
        },
        correct: "b",
        feedback: "Correct. As per standard terrestrial microwave characteristics, bandwidth is typically limited to 1-10 Mbps."
    },
    {
        q: "Why is Infrared communication unreliable outside of buildings?",
        options: {
            a: "Wind blows the signal away",
            b: "Interference from sun rays",
            c: "Rain causes the signal to speed up",
            d: "Oxygen absorbs IR energy instantly"
        },
        correct: "b",
        feedback: "Correct. Solar radiation contains significant IR energy which interferes with modulated IR signals outdoors."
    },
    {
        q: "Which frequency range defines the start of the Infrared spectrum?",
        options: {
            a: "1 GHz",
            b: "300 GHz",
            c: "400 THz",
            d: "2.4 GHz"
        },
        correct: "b",
        feedback: "Yes. The IR spectrum typically begins at 300 GHz, transitioning from the Microwave/Terahertz regime."
    },
    {
        q: "What is an advantage of Terrestrial Microwave over cable systems?",
        options: {
            a: "It is cheaper to install and requires no land acquisition for cables",
            b: "It has unlimited bandwidth",
            c: "It is unaffected by weather conditions",
            d: "It can penetrate solid mountains"
        },
        correct: "a",
        feedback: "Correct. Microwave links are often used because they bypass the need for physical cable trenches and land rights."
    },
    {
        q: "What is a major disadvantage of Terrestrial Microwaves?",
        options: {
            a: "High latency compared to fiber",
            b: "Susceptibility to weather conditions and eavesdropping",
            c: "Requires massive cooling systems",
            d: "Cannot send digital data"
        },
        correct: "b",
        feedback: "Right. Adverse weather can attenuate the signal, and the open-air broadcast is vulnerable to eavesdropping."
    },
    {
        q: "In a satellite link, what happens to the signal received from the earth station?",
        options: {
            a: "It is stored for 12-15 years",
            b: "It is reflected without any change",
            c: "It is amplified and retransmitted to another earth station",
            d: "It is converted into infrared waves instantly"
        },
        correct: "c",
        feedback: "Correct. The satellite acts as an active relay that amplifies and retransmits the Up link signal."
    },
    {
        q: "What characteristic of IR waves allows them to be used safely in adjacent rooms without interference?",
        options: {
            a: "They penetrate through walls easily",
            b: "They are narrowly focused lasers",
            c: "They cannot penetrate opaque walls",
            d: "They only travel in copper wires"
        },
        correct: "c",
        feedback: "Correct. Because IR doesn't penetrate walls, communication in one room is isolated and secure from the next."
    },
    {
        q: "Terrestrial microwave links are particularly useful for communication over which of these?",
        options: {
            a: "Long distances across oceans",
            b: "Difficult terrains like mountains and forests",
            c: "Short distances through dense fog only",
            d: "Communication with deep-sea submarines"
        },
        correct: "b",
        feedback: "Exactly. Microwaves provide an easy solution for terrain where laying cables is physically difficult."
    }
];

let currentQuestion = 0;
let score = 0;

function initQuiz() {
    const quizContent = document.getElementById('quizContent');
    renderQuestion();
}

function renderQuestion() {
    const quizContent = document.getElementById('quizContent');
    const qData = questions[currentQuestion];

    const progress = (currentQuestion / questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    quizContent.innerHTML = `
        <div class="card workbench-card active">
            <div class="hud-label" style="margin-bottom: 1rem;">Question ${currentQuestion + 1} of ${questions.length}</div>
            <h2 style="color: var(--primary-cyan);">${qData.q}</h2>
            <div class="options">
                ${Object.entries(qData.options).map(([key, val]) => `
                    <button class="option-btn" onclick="handleAnswer('${key}')">
                        <strong>${key.toUpperCase()}:</strong> ${val}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

window.handleAnswer = function (selected) {
    const qData = questions[currentQuestion];
    if (selected === qData.correct) {
        score++;
    }

    currentQuestion++;
    if (currentQuestion < questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('progressFill').style.width = `100%`;
    const quizContent = document.getElementById('quizContent');
    const resultArea = document.getElementById('resultArea');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackText = document.getElementById('feedbackText');

    quizContent.style.display = 'none';
    resultArea.style.display = 'block';

    const percentage = Math.round((score / questions.length) * 100);

    feedbackTitle.innerText = percentage >= 70 ? "MISSION SUCCESS" : "MISSION FAILED";
    feedbackTitle.style.color = percentage >= 70 ? "#22c55e" : "#ef4444";
    feedbackTitle.style.borderColor = percentage >= 70 ? "#22c55e" : "#ef4444";

    feedbackText.innerHTML = `
        <div class="score-display">
            <div class="score-circle">${percentage}%</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">You answered ${score} out of ${questions.length} questions correctly.</p>
            <p class="scen-text">${percentage >= 70 ?
            "Excellent work, Engineer! You have mastered the core concepts of fixed-link and short-range wireless systems." :
            "Review the Theory and Engineering Lab sections to strengthen your knowledge of frequency regimes and propagation."
        }</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', initQuiz);
