const lessons = {
  Numbers: [
    { en: "One", fr: "Un" },
    { en: "Two", fr: "Deux" },
    { en: "Three", fr: "Trois" },
    { en: "Four", fr: "Quatre" },
    { en: "Five", fr: "Cinq" }
  ],
  Colors: [
    { en: "Red", fr: "Rouge" },
    { en: "Blue", fr: "Bleu" },
    { en: "Green", fr: "Vert" },
    { en: "Yellow", fr: "Jaune" },
    { en: "Black", fr: "Noir" }
  ],
  Greetings: [
    { en: "Hello", fr: "Bonjour" },
    { en: "Goodbye", fr: "Au revoir" },
    { en: "Please", fr: "S'il vous plait" },
    { en: "Thank you", fr: "Merci" },
    { en: "Good night", fr: "Bonne nuit" }
  ],
  Family: [
    { en: "Mother", fr: "Mere" },
    { en: "Father", fr: "Pere" },
    { en: "Brother", fr: "Frere" },
    { en: "Sister", fr: "Soeur" },
    { en: "Family", fr: "Famille" }
  ],
  Animals: [
    { en: "Cat", fr: "Chat" },
    { en: "Dog", fr: "Chien" },
    { en: "Bird", fr: "Oiseau" },
    { en: "Fish", fr: "Poisson" },
    { en: "Horse", fr: "Cheval" }
  ],
  Food: [
    { en: "Bread", fr: "Pain" },
    { en: "Milk", fr: "Lait" },
    { en: "Apple", fr: "Pomme" },
    { en: "Cheese", fr: "Fromage" },
    { en: "Water", fr: "Eau" }
  ],
  "Body Parts": [
    { en: "Head", fr: "Tete" },
    { en: "Hand", fr: "Main" },
    { en: "Leg", fr: "Jambe" },
    { en: "Eye", fr: "Oeil" },
    { en: "Nose", fr: "Nez" }
  ],
  School: [
    { en: "Book", fr: "Livre" },
    { en: "Pen", fr: "Stylo" },
    { en: "Teacher", fr: "Professeur" },
    { en: "Classroom", fr: "Classe" },
    { en: "Desk", fr: "Bureau" }
  ],
  Verbs: [
    { en: "Eat", fr: "Manger" },
    { en: "Drink", fr: "Boire" },
    { en: "Read", fr: "Lire" },
    { en: "Write", fr: "Ecrire" },
    { en: "Play", fr: "Jouer" }
  ]
};

const levelPlan = [
  "Numbers",
  "Colors",
  "Greetings",
  "Family",
  "Animals",
  "Food",
  "Body Parts",
  "School",
  "Verbs",
  "Mixed"
];

const difficultyRules = {
  easy: { optionCount: 3, points: 10, reverseChance: 0 },
  medium: { optionCount: 4, points: 15, reverseChance: 0.2 },
  hard: { optionCount: 4, points: 20, reverseChance: 0.45 }
};

const promoItems = [
  {
    title: "Daily French Challenge",
    text: "Share your score with friends and challenge them.",
    buttonLabel: "Share this game",
    action: "share"
  },
  {
    title: "Practice More Themes",
    text: "Finish 10 levels and unlock your favorite words.",
    buttonLabel: "Start level 1",
    action: "start"
  },
  {
    title: "Parent Growth Zone",
    text: "Track progress and help your child practice daily.",
    buttonLabel: "Show progress",
    action: "progress"
  }
];

const trackingConfig = {
  countApiNamespace: "french-fun-quest-public",
  countApiKey: "visits"
};

const topicSelect = document.getElementById("topicSelect");
const difficultySelect = document.getElementById("difficultySelect");
const lessonContent = document.getElementById("lessonContent");
const levelBadge = document.getElementById("levelBadge");
const scoreBadge = document.getElementById("scoreBadge");
const visitBadge = document.getElementById("visitBadge");
const questionTitle = document.getElementById("questionTitle");
const optionsBox = document.getElementById("options");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const levelHint = document.getElementById("levelHint");
const levelList = document.getElementById("levelList");
const promoAd = document.getElementById("promoAd");

let gameStarted = false;
let currentLevel = 1;
let score = 0;
let answered = false;
let currentQuestion = null;
let currentDifficulty = "medium";
let localSessionViews = 0;

function topicWords(topic) {
  if (topic === "Mixed") {
    return Object.values(lessons).flat();
  }
  return lessons[topic];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function populateTopics() {
  Object.keys(lessons).forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    topicSelect.append(option);
  });
}

function renderLesson(topic) {
  const words = lessons[topic];
  lessonContent.innerHTML = "";
  words.forEach((word) => {
    const row = document.createElement("div");
    row.className = "lesson-item";
    row.innerHTML = `<span>${word.en}</span><strong>${word.fr}</strong>`;
    lessonContent.append(row);
  });
}

function buildLevelChips() {
  levelList.innerHTML = "";
  for (let i = 1; i <= 10; i += 1) {
    const chip = document.createElement("div");
    chip.className = "level-chip";
    chip.id = `level-chip-${i}`;
    chip.textContent = `L${i}`;
    levelList.append(chip);
  }
  renderLevelChips();
}

function renderLevelChips() {
  for (let i = 1; i <= 10; i += 1) {
    const chip = document.getElementById(`level-chip-${i}`);
    chip.classList.remove("done", "current");
    if (i < currentLevel) {
      chip.classList.add("done");
    } else if (i === currentLevel) {
      chip.classList.add("current");
    }
  }
}

function createQuestion() {
  const topic = levelPlan[currentLevel - 1];
  const pool = topicWords(topic);
  const answer = randomFrom(pool);
  const rules = difficultyRules[currentDifficulty];
  const reverse = Math.random() < rules.reverseChance;
  const askText = reverse ? answer.fr : answer.en;
  const answerText = reverse ? answer.en : answer.fr;
  const allCandidates = topicWords("Mixed").map((word) => (reverse ? word.en : word.fr));
  const wrongOptions = shuffle(allCandidates.filter((item) => item !== answerText)).slice(
    0,
    rules.optionCount - 1
  );
  const options = shuffle([answerText, ...wrongOptions]);

  return {
    topic,
    answer: answerText,
    options,
    prompt: reverse
      ? `Which English word means "${askText}"?`
      : `What is French for "${askText}"?`
  };
}

function renderQuestion() {
  currentQuestion = createQuestion();
  answered = false;
  feedback.textContent = "";
  nextBtn.disabled = true;

  levelBadge.textContent = `Level ${currentLevel}`;
  scoreBadge.textContent = `Score: ${score}`;
  levelHint.textContent = `Topic for this level: ${currentQuestion.topic} | Mode: ${currentDifficulty}`;
  questionTitle.textContent = currentQuestion.prompt;
  optionsBox.innerHTML = "";

  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(option, button));
    optionsBox.append(button);
  });

  renderLevelChips();
  rotatePromoAd();
}

function checkAnswer(selected, selectedButton) {
  if (answered) {
    return;
  }
  answered = true;

  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === currentQuestion.answer) {
      btn.classList.add("correct");
    }
  });

  if (selected === currentQuestion.answer) {
    score += difficultyRules[currentDifficulty].points;
    selectedButton.classList.add("correct");
    feedback.textContent = "Correct! Great job!";
  } else {
    selectedButton.classList.add("wrong");
    feedback.textContent = `Oops! Correct answer: ${currentQuestion.answer}`;
  }

  scoreBadge.textContent = `Score: ${score}`;
  nextBtn.disabled = false;
}

function goNext() {
  if (!answered) {
    feedback.textContent = "Choose an answer first.";
    return;
  }

  if (currentLevel < 10) {
    currentLevel += 1;
    renderQuestion();
  } else {
    questionTitle.textContent = "Amazing! You completed all 10 levels!";
    optionsBox.innerHTML = "";
    feedback.textContent = `Final score: ${score}. You are a French Star!`;
    nextBtn.disabled = true;
    renderLevelChips();
    rotatePromoAd();
  }
}

function startGame() {
  gameStarted = true;
  currentLevel = 1;
  score = 0;
  currentDifficulty = difficultySelect.value;
  startBtn.disabled = true;
  renderQuestion();
}

function rotatePromoAd() {
  const item = randomFrom(promoItems);
  promoAd.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.text}</p>
    <button class="ad-btn" data-action="${item.action}">${item.buttonLabel}</button>
  `;
}

function handlePromoAction(action) {
  if (action === "share" && navigator.share) {
    navigator.share({
      title: "French Fun Quest",
      text: "Try this French game for kids!",
      url: window.location.href
    });
    return;
  }
  if (action === "start") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (action === "progress") {
    feedback.textContent = `Progress: Level ${currentLevel}/10 | Score ${score}`;
  }
}

async function trackVisits() {
  localSessionViews = Number(localStorage.getItem("ffq-local-sessions") || "0") + 1;
  localStorage.setItem("ffq-local-sessions", String(localSessionViews));

  const namespace = trackingConfig.countApiNamespace;
  const key = trackingConfig.countApiKey;
  if (!namespace || !key) {
    visitBadge.textContent = "Visits: local only";
    return;
  }

  try {
    const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
    const data = await response.json();
    visitBadge.textContent = `Visits: ${data.value}`;
  } catch (error) {
    visitBadge.textContent = "Visits: offline";
  }
}

topicSelect.addEventListener("change", (event) => {
  renderLesson(event.target.value);
});

difficultySelect.addEventListener("change", (event) => {
  currentDifficulty = event.target.value;
  if (!gameStarted) {
    levelHint.textContent = `Mode selected: ${currentDifficulty}. Learn and press Start Game.`;
  }
});

promoAd.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.action) {
    handlePromoAction(target.dataset.action);
  }
});

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", goNext);

populateTopics();
renderLesson("Numbers");
buildLevelChips();
rotatePromoAd();
trackVisits();

if (!gameStarted) {
  levelHint.textContent = "Learn a topic, then press Start Game.";
}
