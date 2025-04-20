// Page elements
const selectionPage = document.getElementById("selectionPage");
const chatPage = document.getElementById("chatPage");
const subjectSelect = document.getElementById("subject");
const levelSelect = document.getElementById("level");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const selectedSubject = document.getElementById("selectedSubject");
const selectedLevel = document.getElementById("selectedLevel");
const stepToggle = document.getElementById("stepToggle");
const startLearningBtn = document.getElementById("startLearningBtn");

// Store selected options
let subject = "";
let level = "";

// Start Learning function
function startLearning() {
  // Get selected values
  subject = subjectSelect.value;
  level = levelSelect.value;

  // Validate that both inputs are filled
  if (!subject || !level) {
    // Highlight the empty fields with red border
    if (!subject) {
      subjectSelect.style.border = "1px solid #ff5555";
      setTimeout(() => { subjectSelect.style.border = "1px solid #3a3a3a"; }, 2000);
    }

    if (!level) {
      levelSelect.style.border = "1px solid #ff5555";
      setTimeout(() => { levelSelect.style.border = "1px solid #3a3a3a"; }, 2000);
    }

    // Don't proceed further
    return;
  }

  // Update displayed values in chat header
  selectedSubject.textContent = subject;
  selectedLevel.textContent = level;

  // Clear any existing messages in the chat container
  chatContainer.innerHTML = "";

  // Hide selection page and show chat page
  selectionPage.classList.add("hidden");
  chatPage.classList.remove("hidden");

  // Add welcome message
  appendMessage("ai", `Welcome to your ${subject} tutoring session! How can I help you with ${subject} today?`);

  // Focus on input field
  userInput.focus();
}

// Send message
window.sendMessage = async function () {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  userInput.value = "";

  const isStepByStep = stepToggle.checked;
  const fullPrompt = `Subject: ${subject}\nLevel: ${level}\nStep-by-step: ${isStepByStep}\nQuestion: ${prompt}`;

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    const data = await res.json();
    appendMessage("ai", data.answer || "No answer received.");
  } catch (err) {
    console.error("Error:", err);
    appendMessage("ai", "Something went wrong. Please try again.");
  }
};

// Append message to chat
function appendMessage(role, content) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-msg" : "ai-msg";

  if (role === "user") {
    msg.innerHTML = `<strong>You:</strong> ${content}`;
  } else {
    msg.innerHTML = `<strong>Tutor:</strong> ${content}`;
  }

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle Enter key press in input field
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

// Reset validation styling when selecting options
subjectSelect.addEventListener("change", function () {
  if (this.value) {
    this.style.border = "1px solid #3a3a3a";
  }
});

levelSelect.addEventListener("change", function () {
  if (this.value) {
    this.style.border = "1px solid #3a3a3a";
  }
});

// Make sure DOM is fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", function () {
  // Add click event listener to the start learning button
  if (startLearningBtn) {
    startLearningBtn.addEventListener("click", startLearning);
  } else {
    // Fallback to finding the button by selector if the ID approach fails
    const startButton = document.querySelector("button[onclick='startLearning()']");
    if (startButton) {
      startButton.removeAttribute("onclick");
      startButton.addEventListener("click", startLearning);
    }
  }
});