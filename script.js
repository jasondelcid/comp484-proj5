
let map;
let currentQuestion = 0;
let score = 0;
let answerCircle;
let timerInterval;
let seconds = 0;
let gameFinished = false;

const locationPrompt = document.querySelector("#location-prompt");
const questionNumber = document.querySelector("#question-number");
const scoreDisplay = document.querySelector("#score");
const message = document.querySelector("#message");
const nextButton = document.querySelector("#next-button");
const restartButton = document.querySelector("#restart-button");
const timerDisplay = document.querySelector("#timer");
const highScoreDisplay = document.querySelector("#high-score");

const csunCenter = {
    lat: 34.2406,
    lng: -118.5296
};

const locations = [
    {
        name: "Donald Bianchi Planetarium",
        lat: 34.23914377317704,
        lng:  -118.52847906840253,
        radius: 55
    },
    {
        name: "University Library",
        lat: 34.24008666370064,
        lng:  -118.52932433074511,
        radius: 70
    },
    {
        name: "The Soraya",
        lat: 34.236352711287815,
        lng: -118.52869249996144,
        radius: 70
    },
    {
        name: "Student Recreation Center",
        lat: 34.2400153674283,
        lng: -118.5249272483403,
        radius: 70
    },
    {
        name: "Campus Store Complex",
        lat: 34.237565303998224,
        lng: -118.5281838360882,
        radius: 70
    }
];

// Create the Google Map.
function initMap() {
    map = new google.maps.Map(document.querySelector("#map"), {
        center: csunCenter,
        zoom: 16,
        disableDoubleClickZoom: true,
        draggable: false,
        scrollwheel: false,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
    });

    loadHighScore();
    startTimer();
    loadQuestion();

    map.addListener("dblclick", checkAnswer);
}

// Load the current question.
function loadQuestion() {
    if (answerCircle) {
        answerCircle.setMap(null);
    }

    message.innerHTML = "Double click your answer on the map.";
    nextButton.style.display = "none";

    locationPrompt.innerHTML = "Find: " + locations[currentQuestion].name;
    questionNumber.innerHTML = currentQuestion + 1;
    scoreDisplay.innerHTML = score;
}

// Check the user's double click answer.
function checkAnswer(event) {
    if (gameFinished || nextButton.style.display === "inline-block") {
        return;
    }

    const selectedLocation = event.latLng;
    const correctLocation = locations[currentQuestion];

    const correctLatLng = new google.maps.LatLng(correctLocation.lat, correctLocation.lng);

    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        selectedLocation,
        correctLatLng
    );

    if (distance <= correctLocation.radius) {
        score++;
        scoreDisplay.innerHTML = score;
        message.innerHTML = "Correct!";
        showAnswerCircle("green");
    } else {
        message.innerHTML = "Wrong! The correct location is shown in red.";
        showAnswerCircle("red");
    }

    nextButton.style.display = "inline-block";
}

// Show the correct answer area.
function showAnswerCircle(color) {
    const correctLocation = locations[currentQuestion];

    answerCircle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: color,
        fillOpacity: 0.3,
        map: map,
        center: {
            lat: correctLocation.lat,
            lng: correctLocation.lng
        },
        radius: correctLocation.radius
    });
}

// Move to the next question.
function nextQuestion() {
    currentQuestion++;

    if (currentQuestion >= locations.length) {
        endGame();
    } else {
        loadQuestion();
    }
}

// End the game.
function endGame() {
    gameFinished = true;
    clearInterval(timerInterval);

    locationPrompt.innerHTML = "Game Over!";
    message.innerHTML = "You got " + score + " out of " + locations.length + " correct.";
    nextButton.style.display = "none";

    if (score === locations.length) {
        saveHighScore();
    }
}

// Restart the game.
function restartGame() {
    currentQuestion = 0;
    score = 0;
    seconds = 0;
    gameFinished = false;

    clearInterval(timerInterval);
    timerDisplay.innerHTML = "00:00";

    if (answerCircle) {
        answerCircle.setMap(null);
    }

    startTimer();
    loadQuestion();
}

// Start the timer.
function startTimer() {
    timerInterval = setInterval(function() {
        seconds++;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        timerDisplay.innerHTML = addZero(minutes) + ":" + addZero(remainingSeconds);
    }, 1000);
}

// Add a leading zero.
function addZero(number) {
    if (number < 10) {
        return "0" + number;
    }

    return number;
}

// Save high score if all answers are correct.
function saveHighScore() {
    const bestTime = localStorage.getItem("csunMapBestTime");

    if (bestTime === null || seconds < Number(bestTime)) {
        localStorage.setItem("csunMapBestTime", seconds);
        loadHighScore();
        message.innerHTML += " New best time!";
    }
}

// Load high score.
function loadHighScore() {
    const bestTime = localStorage.getItem("csunMapBestTime");

    if (bestTime === null) {
        highScoreDisplay.innerHTML = "None";
    } else {
        const minutes = Math.floor(Number(bestTime) / 60);
        const remainingSeconds = Number(bestTime) % 60;

        highScoreDisplay.innerHTML = addZero(minutes) + ":" + addZero(remainingSeconds);
    }
}

nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartGame);