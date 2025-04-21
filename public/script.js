// Page elements
const selectionPage = document.getElementById("selectionPage");
const chatPage = document.getElementById("chatPage");
const subjectSelect = document.getElementById("subject");
const levelDisplay = document.getElementById("dropdownToggle"); // Visual element
const levelHiddenInput = document.getElementById("level"); // Hidden input to store value
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const selectedSubject = document.getElementById("selectedSubject");
const selectedLevel = document.getElementById("selectedLevel");
const stepToggle = document.getElementById("stepToggle");
const startLearningBtn = document.getElementById("startLearningBtn");

// Store selected options
let subject = "";
let level = "";

document.addEventListener("DOMContentLoaded", () => {
  if (startLearningBtn) {
    startLearningBtn.addEventListener("click", startLearning);
  }
  const toggle = document.getElementById("dropdownToggle");
  const menu = document.getElementById("dropdownOptions");
  const options = document.querySelectorAll("#dropdownOptions li");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
    toggle.classList.toggle("pulse");
  });

  options.forEach(item => {
    item.addEventListener("click", () => {
      menu.classList.add("hidden");
      toggle.classList.remove("pulse");
      const value = item.getAttribute("data-value");
      levelDisplay.textContent = value;
      levelHiddenInput.value = value;

    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
      toggle.classList.remove("pulse");
    }
  });

});

// Start Learning function
function startLearning() {
  subject = subjectSelect.value;
  level = levelHiddenInput.value;

  // Validate that both inputs are filled
  if (!subject || !level) {
    if (!subject) {
      subjectSelect.style.border = "1px solid #ff5555";
      setTimeout(() => { subjectSelect.style.border = "1px solid #3a3a3a"; }, 2000);
    }

    if (!level) {
      levelDisplay.style.border = "1px solid #ff5555";
      setTimeout(() => { levelDisplay.style.border = "1px solid #3a3a3a"; }, 2000);
    }

    return;
  }

  selectedSubject.textContent = subject;
  selectedLevel.textContent = level;
  chatContainer.innerHTML = "";
  selectionPage.classList.add("hidden");
  chatPage.classList.remove("hidden");
  appendMessage("ai", `Welcome to your ${subject} tutoring session! How can I help you with ${subject} today?`);
  userInput.focus();
}

// Send message
window.sendMessage = async function () {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  userInput.value = "";

  const isStepByStep = stepToggle.checked;
  const fullPrompt = `You're answering for a ${level}-level student.\nSubject: ${subject}\nStep-by-step: ${isStepByStep}\nQuestion: ${prompt}`;

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        ageLevel: level
      })
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

  msg.innerHTML = `<strong>${role === "user" ? "You" : "Tutor"}:</strong> ${content}`;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter key to send
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

// Reset subject validation
subjectSelect.addEventListener("change", function () {
  if (this.value) {
    this.style.border = "1px solid #3a3a3a";
  }
});
