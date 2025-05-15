// Auth Elements
const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// App Elements
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const wordInput = document.getElementById("wordInput");
const speakBtn = document.getElementById("speakBtn");
const statusText = document.getElementById("status");
const audioPlayback = document.getElementById("audioPlayback");
const downloadLink = document.getElementById("downloadLink");
const feedbackText = document.getElementById("feedback");
const scoreText = document.getElementById("score");
const correctionText = document.getElementById("correction");
const themeToggle = document.getElementById("themeToggle");
const languageSelect = document.getElementById("languageSelect");
const timerDisplay = document.getElementById("timerDisplay");  // Timer display

let mediaRecorder;
let audioChunks = [];
let audioContext, analyser, dataArray, canvasCtx;
const visualizer = document.getElementById("visualizer");
canvasCtx = visualizer.getContext("2d");

let timerInterval;  // To store the timer interval

// Function to visualize audio
function visualizeAudio(stream) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = "black";
        canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "#4CAF50";
        canvasCtx.beginPath();

        let sliceWidth = visualizer.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let y = (dataArray[i] / 255) * visualizer.height;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        canvasCtx.stroke();
    }

    draw();
}

// Start Recording
recordBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            downloadLink.href = audioUrl;
            downloadLink.download = "recording.wav";
            downloadLink.style.display = "block";

            analyzeSpeech(audioBlob, languageSelect.value);
        };

        visualizeAudio(stream);
        mediaRecorder.start();
        statusText.innerText = "Status: Recording...";
        recordBtn.disabled = true;
        stopBtn.disabled = false;

        let secondsRemaining = 30;  // 30 seconds timer
        timerDisplay.innerText = `Time Remaining: ${secondsRemaining}s`;

        // Update the timer every second
        timerInterval = setInterval(() => {
            secondsRemaining--;
            timerDisplay.innerText = `Time Remaining: ${secondsRemaining}s`;

            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                mediaRecorder.stop();
                statusText.innerText = "Status: Recording Stopped";
                recordBtn.disabled = false;
                stopBtn.disabled = true;
            }
        }, 1000);

    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
});

// Stop Recording
stopBtn.addEventListener("click", () => {
    clearInterval(timerInterval);  // Clear the timer interval
    mediaRecorder.stop();
    statusText.innerText = "Status: Recording Stopped";
    recordBtn.disabled = false;
    stopBtn.disabled = true;
});

// Simulated Speech Analysis
async function analyzeSpeech(audioBlob, language) {
    feedbackText.innerText = "Analyzing speech...";

    setTimeout(() => {
        const randomScore = Math.floor(Math.random() * (100 - 60) + 60);
        scoreText.innerText = `Pronunciation Score: ${randomScore}%`;

        correctionText.innerText = `Correct Pronunciation: "${wordInput.value}"`;
        feedbackText.innerText = randomScore > 80 ? "Good pronunciation!" : "Try again for better clarity!";
    }, 3000);
}

// Speak Correct Pronunciation
speakBtn.addEventListener("click", () => {
    const text = wordInput.value;
    if (!text) {
        alert("Enter a word first!");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    speechSynthesis.speak(utterance);
});

// Dark Mode Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Auth Functions
function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
}

// Toggle views
showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    registerSection.style.display = "block";
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerSection.style.display = "none";
    loginSection.style.display = "block";
});

// Register
registerBtn.addEventListener("click", () => {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    if (username && password) {
        localStorage.setItem("user_" + username, password);
        alert("Registration successful! Please log in.");
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    } else {
        alert("Please fill in both fields.");
    }
});

// Login
loginBtn.addEventListener("click", () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const storedPassword = localStorage.getItem("user_" + username);

    if (storedPassword === password) {
        alert("Login successful!");
        showApp();
    } else {
        alert("Invalid credentials. Try again.");
    }
});
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

let isPaused = false;
let recordedChunks = [];

recordBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(recordedChunks, { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            downloadLink.href = audioUrl;
            downloadLink.download = "recording.wav";
            downloadLink.style.display = "block";

            analyzeSpeech(audioBlob, languageSelect.value);
        };

        visualizeAudio(stream);
        mediaRecorder.start();
        statusText.innerText = "Status: Recording...";
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;

        // Add Pause functionality
        pauseBtn.addEventListener("click", () => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.pause();
                isPaused = true;
                pauseBtn.disabled = true;
                resumeBtn.disabled = false;
                statusText.innerText = "Status: Paused";
            }
        });

        // Add Resume functionality
        resumeBtn.addEventListener("click", () => {
            if (mediaRecorder.state === "paused") {
                mediaRecorder.resume();
                isPaused = false;
                resumeBtn.disabled = true;
                pauseBtn.disabled = false;
                statusText.innerText = "Status: Recording...";
            }
        });
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
});
