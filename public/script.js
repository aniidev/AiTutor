const selectionPage = document.getElementById("selectionPage");
const chatPage = document.getElementById("chatPage");
const subjectSelect = document.getElementById("subject");
const levelDisplay = document.getElementById("dropdownToggle");
const levelHiddenInput = document.getElementById("level");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const selectedSubject = document.getElementById("selectedSubject");
const selectedLevel = document.getElementById("selectedLevel");
const stepToggle = document.getElementById("stepToggle");
const startLearningBtn = document.getElementById("startLearningBtn");
const videoToggle = document.getElementById("ytToggleBtn");

// Store selected options
let subject = "";
let level = "";
let sessionId = null; // Added session tracking
let video = false;

videoToggle.addEventListener("click", (e) => {
  video = !video;
  videoToggle.classList.toggle('active');
});

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

  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
      toggle.classList.remove("pulse");
    }
  });

  if (startLearningBtn) {
    startLearningBtn.addEventListener("click", startLearning);
  }
});

function startLearning() {
  subject = subjectSelect.value;
  level = levelHiddenInput.value;

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

  // Generate new session ID
  sessionId = crypto.randomUUID();

  selectedSubject.textContent = subject;
  selectedLevel.textContent = level;
  chatContainer.innerHTML = "";
  selectionPage.classList.add("hidden");
  chatPage.classList.remove("hidden");
  appendMessage("ai", `Welcome to your ${subject} tutoring session! How can I help you with ${subject} today?`);
  userInput.focus();
}

window.sendMessage = async function () {
  const prompt = userInput.value.trim();
  if (!prompt || !sessionId) return;

  appendMessage("user", prompt);
  userInput.value = "";

  const isStepByStep = false;
  const showYoutube = video;
  const fullPrompt = `Subject: ${subject}\nStep-by-step: ${isStepByStep}\nQuestion: ${prompt}`;

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        ageLevel: level,
        sessionId,
        showYoutube
      })
    });

    const data = await res.json();

    if (!data.answer) {
      appendMessage("ai", "No answer received.");
    } else {
      appendMessage("ai", data.answer);
    }

    if (showYoutube && data.videoUrl) {
      const videoEmbed = document.createElement("iframe");
      videoEmbed.width = "560";
      videoEmbed.height = "315";
      videoEmbed.className = "rounded-2xl shadow-md w-full max-w-xl my-4";
      videoEmbed.src = data.videoUrl.replace("watch?v=", "embed/");
      videoEmbed.title = "YouTube video";
      videoEmbed.frameBorder = "0";
      videoEmbed.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoEmbed.allowFullscreen = true;

      chatContainer.appendChild(videoEmbed);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

  } catch (err) {
    console.error("Error:", err);
    appendMessage("ai", "Something went wrong. Please try again.");
  }
};


function appendMessage(role, content) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-msg" : "ai-msg";

  // Handle code blocks
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
const formattedContent = content.replace(codeBlockRegex, (match, code) => {
  const escapedCode = escapeHtml(code.trim());
  return `
    <div class="relative my-4">
      <button class="copy-btn absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600">Copy</button>
      <pre class="bg-[#2d2d2d] text-white p-4 rounded-md overflow-x-auto">
        <code>${escapedCode.trim()}</code>
      </pre>
    </div>
  `;
});

  msg.innerHTML = `<strong>${role === "user" ? "You" : "Tutor"}:</strong> ${formattedContent}`;
  msg.innerHTML.trim();
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Re-render LaTeX
  if (window.MathJax) {
    MathJax.typesetPromise([msg]);
  }

  // Add copy functionality
  msg.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
      const code = button.nextElementSibling.querySelector('code').innerText;
      navigator.clipboard.writeText(code)
        .then(() => {
          button.textContent = "Copied!";
          setTimeout(() => (button.textContent = "Copy"), 1500);
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          button.textContent = "Error";
        });
    });
  });
}



function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

subjectSelect.addEventListener("change", function () {
  if (this.value) {
    this.style.border = "1px solid #3a3a3a";
  }
});

//google auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    //set this up later
    res.redirect('/public/index.html');
  }
);