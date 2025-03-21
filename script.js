const groupContainer = document.getElementById("group-container");
const questionContainer = document.getElementById("question-container");
const answerContainer = document.getElementById("answer-container");
const question = document.getElementById("question");
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const correctText = document.getElementById("correct-text");

let content = {};
let correctSounds = [];
let wrongSounds = [];
fetch("https://axelmiri.github.io/tippmal/content.json")
    .then((response) => response.json())
    .then((data) => {
        content = data;
        correctSounds = data.correctSounds.map((sound) => new Audio(sound));
        wrongSounds = data.wrongSounds.map((sound) => new Audio(sound));
        showStartScreen();
    });

function showStartScreen() {
    hideAll();
    groupContainer.style.display = "block";

    for (const group of content.groups) {
        const button = document.createElement("button");
        button.innerText = group.name;
        const img = document.createElement("img");
        img.src = "https://axelmiri.github.io/tippmal/" + group.image;
        button.prepend(img);
        button.addEventListener("click", () => showQuestion(group));
        groupContainer.appendChild(button);
    }
}

function showQuestion(group, questionIndex = 0) {
    hideAll();
    questionContainer.style.display = "block";

    questionText.innerText = group.questions[questionIndex].question;
    questionImage.src =
        "https://axelmiri.github.io/tippmal/" +
        group.questions[questionIndex].image;

    document.addEventListener(
        "click",
        () => {
            showAnswers(group, questionIndex);
        },
        { once: true }
    );
}

function showAnswers(group, questionIndex) {
    hideAll();
    answerContainer.style.display = "block";
    question.style.display = "block";

    question.innerText = group.questions[questionIndex].question;

    const answers = [...group.questions[questionIndex].answers];
    answers.sort(() => Math.random() - 0.5);

    for (const answer of answers) {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.addEventListener("click", () => {
            if (button.innerText === group.questions[questionIndex][0]) {
                showCorrectScreen(group, questionIndex);
                pickRandom(correctSounds).play();
            } else {
                pickRandom(wrongSounds).play();
            }
        });
        answerContainer.appendChild(button);
    }
}

function showCorrectScreen(group, questionIndex) {
    hideAll();
    correctText.style.display = "block";
    correctText.innerText = group.questions[questionIndex].correct;

    document.addEventListener(
        () => {
            showQuestion(group, questionIndex + 1);
        },
        { once: true }
    );
}

function hideAll() {
    groupContainer.style.display = "none";
    questionContainer.style.display = "none";
    answerContainer.style.display = "none";
    question.style.display = "none";
    correctText.style.display = "none";
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
