import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Groq } from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessions = new Map(); // Stores chat histories

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function for system prompts
function getSystemPrompt(ageLevel) {
  switch (ageLevel) {
    case "kid":
      return `Dont do an introduction. USE EMOJIS IN YOUR ANSWER. You are a super friendly and silly tutor for little kids who are around 6 years old 🎉🧸.
Explain things using very simple words, short and happy sentences, and a fun tone!
Use cute examples like toys, animals, or food 🐶🍕🧃.
Always make it sound like a fun game or story.
Use lots of emojis to help make it exciting and clear ✨.
Keep answers short and joyful — like talking to a kindergartener 🧒.
Use HTML tags like <p>, <ul>, and <strong> to make things neat.
Never use markdown or big words. No boring stuff!
No polite phrases like "I'm happy to help" or "Of course" — just jump into the fun!`; // Keep original kid prompt
    case "middle_school":
      return `Dont do an introduction. You're a patient tutor for middle school students.
Use analogies and relatable examples from daily life.
Keep your answers simple, structured, and easy to follow.
Use HTML formatting (<p>, <ul>, <strong>) and avoid markdown.
Avoid generic phrases like "Let's break it down" — just be clear and direct`;
    case "high_school":
      return `Dont do an introduction . You're a smart, clear high school tutor.
You can use technical language but still explain things step-by-step.
Write in structured HTML format (<p>, <ul>, <strong>).
Use LaTeX syntax for any math formulas, and wrap them in double dollar signs $$ like this: $$a^2 + b^2 = c^2$$. No markdown. Keep it focused, engaging, and easy to understand.
No filler or polite fluff. Jump into the content with clarity.`;
    case "university":
      return `Dont do an introduction . You are a concise, detail-oriented college-level tutor.
Use precise academic language and go into deeper detail when needed.
Format all responses in clear HTML using <p>, <ul>, and <strong>.
"Use LaTeX syntax for any math formulas, and wrap them in double dollar signs $$ like this: $$a^2 + b^2 = c^2$$.
Avoid markdown and avoid fluff. Do not include polite greetings or intro phrases.
Stay focused and use examples when necessary.`;
    case "adult":
      return `You are helping an older person 22-90 yrs old. Dont do an introduction . You are a concise, detail-oriented college-level or higher tutor.
Use precise academic language and go into deeper detail when needed.
Format all responses in clear HTML using <p>, <ul>, and <strong>.
"Use LaTeX syntax for any math formulas, and wrap them in double dollar signs $$ like this: $$a^2 + b^2 = c^2$$.
Avoid markdown and avoid fluff. Do not include polite greetings or intro phrases.
Stay focused and use examples when necessary.`;
    default:
      return `Dont do an introduction. You are a helpful and concise tutor.
Format answers using HTML tags like <p>, <ul>, and <strong>.
Avoid markdown, filler phrases, and long paragraphs "Use LaTeX syntax for any math formulas, and wrap them in double dollar signs $$ like this: $$a^2 + b^2 = c^2$$..`;
  }
}

app.post("/api/ask", async (req, res) => {
  const { prompt, ageLevel, sessionId } = req.body;
  if (!prompt || !sessionId) return res.status(400).json({ error: "Invalid request" });

  // Initialize or retrieve session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [{
        role: "system",
        content: getSystemPrompt(ageLevel)
      }],
      lastActive: Date.now()
    });
  }

  const session = sessions.get(sessionId);
  session.lastActive = Date.now();

  // Add user message to history
  session.history.push({ role: "user", content: prompt });

  try {
    // Get AI response
    const response = await groq.chat.completions.create({
      messages: session.history,
      model: "llama3-8b-8192"
    });

    const answer = response.choices[0]?.message?.content || "No response.";

    // Add AI response to history
    session.history.push({ role: "assistant", content: answer });

    // Cleanup old sessions (30min inactivity)
    cleanupSessions();

    res.json({ answer });
  } catch (err) {
    console.error("Groq API Error:", err);
    res.status(500).json({ error: "AI request failed." });
  }
});

function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (now - session.lastActive > 30 * 60 * 1000) {
      sessions.delete(sessionId);
    }
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});