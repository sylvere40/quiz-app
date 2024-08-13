// Sélection des éléments de l'interface utilisateur
const startButton = document.getElementById("startButton");
const loginButton = document.getElementById("loginButton");
const restartButton = document.getElementById("restartButton");
const homeSection = document.getElementById("home");
const loginSection = document.getElementById("login");
const quizSection = document.getElementById("quiz");
const scoreSection = document.getElementById("score");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const existingAccountsDiv = document.getElementById("existingAccounts");
const nextButton = document.getElementById("nextButton");

// Variables globales pour la gestion des utilisateurs et des questions
let users = [];
let currentUser = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLimit = 30;

// Charger les utilisateurs depuis le fichier JSON
async function loadUsers() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        users = data.users || [];
        displayExistingAccounts();
    } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs : ", error);
    }
}

// Afficher les comptes existants sur la page de connexion
function displayExistingAccounts() {
    existingAccountsDiv.innerHTML = "";
    users.forEach(user => {
        const accountButton = document.createElement('button');
        accountButton.textContent = user.username;
        accountButton.onclick = () => autoLogin(user.username);
        existingAccountsDiv.appendChild(accountButton);
    });
}

// Connexion automatique lorsqu'un utilisateur clique sur son compte
function autoLogin(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        currentUser = user;
        loginSection.classList.remove("hidden");
        homeSection.classList.add("hidden");
    }
}

// Sauvegarder les utilisateurs dans le fichier JSON
async function saveUsers() {
    try {
        await fetch('data.json', {
            method: 'POST', // Pour un serveur, utiliser PUT ou POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users: users }),
        });
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des utilisateurs : ", error);
    }
}

// Gérer le clic sur le bouton "Commencer"
startButton.addEventListener("click", () => {
    playSound("clickSound");
    homeSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    loadUsers();
});

// Gérer le clic sur le bouton "Se connecter"
loginButton.addEventListener("click", () => {
    playSound("clickSound");
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Veuillez entrer un nom d'utilisateur et un mot de passe.");
        return;
    }

    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
        return;
    }

    currentUser = user;
    startQuiz();
});

// Démarrer le quiz
function startQuiz() {
    loginSection.classList.add("hidden");
    quizSection.classList.remove("hidden");
    currentQuestionIndex = 0;
    score = 0;
    loadQuestions();
}

// Charger les questions du quiz depuis l'API
async function loadQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10');
        const data = await response.json();
        questions = data.results.map((item) => ({
            question: item.question,
            options: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
            answer: item.correct_answer
        }));
        showQuestion();
    } catch (error) {
        console.error("Erreur lors du chargement des questions : ", error);
    }
}

// Afficher la question actuelle
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const questionObj = questions[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");

    questionElement.innerHTML = questionObj.question;
    optionsElement.innerHTML = "";

    questionObj.options.forEach((option) => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        optionButton.onclick = () => handleAnswer(option);
        optionsElement.appendChild(optionButton);
    });

    nextButton.classList.add("hidden");
    startTimer();
}

// Gérer la réponse de l'utilisateur
function handleAnswer(selectedOption) {
    const questionObj = questions[currentQuestionIndex];

    if (selectedOption === questionObj.answer) {
        playSound("correctSound");
        score++;
    } else {
        playSound("wrongSound");
    }

    clearInterval(timer);
    nextButton.classList.remove("hidden");
}

// Gérer le clic sur le bouton "Suivant"
nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    showQuestion();
});

// Démarrer le minuteur pour la question actuelle
function startTimer() {
    const timerElement = document.getElementById("timer");
    timeLimit = 30; // Ajuster le temps selon le niveau de difficulté
    timerElement.textContent = `Temps restant : ${timeLimit}s`;

    timer = setInterval(() => {
        timeLimit--;
        timerElement.textContent = `Temps restant : ${timeLimit}s`;
        if (timeLimit <= 1) {
            clearInterval(timer);
            handleAnswer(""); // Considérer comme une mauvaise réponse si le temps est écoulé
        }
    }, 1000);
}

// Terminer le quiz et afficher le score
function endQuiz() {
    quizSection.classList.add("hidden");
    scoreSection.classList.remove("hidden");

    const scoreValueElement = document.getElementById("scoreValue");
    scoreValueElement.textContent = `Votre score est : ${score}`;

    // Enregistrer le score de l'utilisateur actuel
    currentUser.scores.push(score);
    saveUsers();
}

// Gérer le clic sur le bouton "Recommencer"
restartButton.addEventListener("click", () => {
    playSound("clickSound");
    scoreSection.classList.add("hidden");
    homeSection.classList.remove("hidden");
});

// Fonction utilitaire pour jouer un son
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
}

// Sélectionner l'élément audio
const backgroundMusic = document.getElementById("backgroundMusic");

// Jouer l'audio lorsque l'utilisateur démarre le jeu
startButton.addEventListener("click", () => {
    backgroundMusic.play();
    playSound("clickSound");
    homeSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    loadUsers();
});

// Vous pouvez également ajouter des contrôles pour arrêter ou mettre en pause le son
// Par exemple, arrêter la musique lorsque le quiz est terminé
function endQuiz() {
    quizSection.classList.add("hidden");
    scoreSection.classList.remove("hidden");

    const scoreValueElement = document.getElementById("scoreValue");
    scoreValueElement.textContent = `Votre score est : ${score}`;

    // Arrêter la musique lorsque le quiz est terminé
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Remettre au début si nécessaire

    // Enregistrer le score de l'utilisateur actuel
    currentUser.scores.push(score);
    saveUsers();
}

// Charger les utilisateurs depuis le fichier JSON
async function loadUsers() {
    try {
        const response = await fetch('users.json');
        const data = await response.json();
        users = data.users || [];
        displayExistingAccounts();
    } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs : ", error);
    }
}





// Afficher les scores précédents de l'utilisateur
function displayUserScores() {
    const scoreList = document.getElementById("scoreList");
    scoreList.innerHTML = "";

    currentUser.scores.forEach((score, index) => {
        const scoreItem = document.createElement('li');
        scoreItem.textContent = `Score : ${score}`;
        scoreItem.style.animationDelay = `${index * 0.1}s`; // Décalage pour chaque score
        scoreList.appendChild(scoreItem);
    });
}


// Appeler cette fonction lorsque l'utilisateur se connecte
loginButton.addEventListener("click", () => {
    
    displayUserScores();
});








// Enregistrer le score de l'utilisateur actuel
function endQuiz() {
    quizSection.classList.add("hidden");
    scoreSection.classList.remove("hidden");

    const scoreValueElement = document.getElementById("scoreValue");
    scoreValueElement.textContent = `Votre score est : ${score}`;

    currentUser.scores.push(score);
    displayUserScores();
}
