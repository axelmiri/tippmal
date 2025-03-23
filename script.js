const homeButton = document.getElementById("home-button");
const groupContainer = document.getElementById("group-container");
const questionContainer = document.getElementById("question-container");
const answerContainer = document.getElementById("answer-container");
const question = document.getElementById("question");
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const correctContainer = document.getElementById("correct-container");
const correctText = document.getElementById("correct-text");
const correctImg = document.getElementById("correct-image");

let content = {};
let correctSounds = [];
let wrongSounds = [];
fetch("content.json")
    .then((response) => response.json())
    .then((data) => {
        content = data;
        correctSounds = data.correctSounds.map((sound) => new Audio(sound));
        wrongSounds = data.wrongSounds.map((sound) => new Audio(sound));
        showStartScreen();
    });

homeButton.addEventListener("click", showStartScreen);

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("service-worker.js")
        .then((registration) => {
            console.log(
                "Service Worker registered with scope:",
                registration.scope
            );
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
}

function showStartScreen() {
    hideAll();
    homeButton.style.display = "none";
    groupContainer.style.display = "block";

    for (const group of content.groups) {
        const button = document.createElement("button");
        button.innerText = group.name;
        const img = document.createElement("img");
        img.classList.add("grid-item");
        img.src = group.image;
        img.setAttribute("draggable", false);
        button.prepend(document.createElement("br"));
        button.prepend(img);
        button.addEventListener("click", () =>
            showQuestion(group, group.questions === "auto" ? group.from : 0)
        );
        groupContainer.appendChild(button);
    }
}

function showQuestion(group, questionIndex) {
    hideAll();
    homeButton.style.display = "block";
    questionContainer.style.display = "block";

    if (group.questions === "auto") {
        questionText.innerText = "";
        questionImage.src = `${group.folder}/${questionIndex}.${group.type}`;
    } else {
        questionText.innerText = group.questions[questionIndex].question;
        questionImage.src = group.questions[questionIndex].questionImage;
    }
    questionImage.setAttribute("draggable", false);

    questionContainer.addEventListener(
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

    let correctAnswer;
    let answers = [];
    if (group.questions === "auto") {
        question.innerText = "";
        for (let i = 1; i <= group.answers; i++) {
            const answer = `${group.folder}/${questionIndex + i}.${group.type}`;
            if (i == 1) correctAnswer = answer;
            answers.push(answer);
        }
    } else {
        question.innerText = group.questions[questionIndex].question;
        answers = [...group.questions[questionIndex].answers];
        correctAnswer = group.questions[questionIndex].answers[0];
    }

    answers.sort(() => Math.random() - 0.5);

    for (const answer of answers) {
        const img = document.createElement("img");
        img.classList.add("grid-item");
        img.src = answer;
        img.setAttribute("draggable", false);
        img.addEventListener("click", () => {
            if (img.src.includes(correctAnswer)) {
                pickRandom(correctSounds).play();
                img.style.filter =
                    "sepia(100%) saturate(500%) hue-rotate(30deg)";
                setTimeout(() => {
                    showCorrectScreen(group, questionIndex);
                }, 500);
            } else {
                pickRandom(wrongSounds).play();
                img.style.filter =
                    "sepia(100%) saturate(500%) hue-rotate(302deg)";
                setTimeout(() => {
                    showQuestion(group, questionIndex);
                }, 500);
            }
        });
        answerContainer.appendChild(img);
    }
}

function showCorrectScreen(group, questionIndex) {
    hideAll();
    correctContainer.style.display = "block";
    correctText.innerText =
        group.questions === "auto"
            ? "Sììì!"
            : group.questions[questionIndex].correct;
    correctImg.src =
        group.questions === "auto"
            ? `${group.folder}/${questionIndex + 1}.${group.type}`
            : group.questions[questionIndex].answers[0];

    document.addEventListener(
        "click",
        () => {
            if (
                questionIndex >=
                (group.questions === "auto"
                    ? group.to - group.answers
                    : group.questions.length - 1)
            ) {
                showStartScreen();
                return;
            }
            showQuestion(
                group,
                questionIndex +
                    (group.questions === "auto" ? group.answers + 1 : 1)
            );
        },
        { once: true }
    );
}

function hideAll() {
    groupContainer.style.display = "none";
    questionContainer.style.display = "none";
    answerContainer.style.display = "none";
    question.style.display = "none";
    correctContainer.style.display = "none";
    for (const child of answerContainer.children) {
        child.style.display = "none";
    }
    for (const child of groupContainer.children) {
        child.style.display = "none";
    }
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
