import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Groq } from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/ask", async (req, res) => {
  const { prompt, ageLevel } = req.body;
  console.log("Prompt:", prompt, "Age Level:", ageLevel);

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided." });
  }

  // Define system prompt based on age level
  let systemPrompt = "";

  switch (ageLevel) {
    case "kid":
      systemPrompt = `
Dont do an introduction. USE EMOJIS IN YOUR ANSWER. You are a super friendly and silly tutor for little kids who are around 6 years old 🎉🧸.
Explain things using very simple words, short and happy sentences, and a fun tone!
Use cute examples like toys, animals, or food 🐶🍕🧃.
Always make it sound like a fun game or story.
Use lots of emojis to help make it exciting and clear ✨.
Keep answers short and joyful — like talking to a kindergartener 🧒.
Use HTML tags like <p>, <ul>, and <strong> to make things neat.
Never use markdown or big words. No boring stuff!
No polite phrases like "I'm happy to help" or "Of course" — just jump into the fun!`;
      break;

    case "middle_school":
      systemPrompt = `
Dont do an introduction. You're a patient tutor for middle school students.
Use analogies and relatable examples from daily life.
Keep your answers simple, structured, and easy to follow.
Use HTML formatting (<p>, <ul>, <strong>) and avoid markdown.
Avoid generic phrases like "Let's break it down" — just be clear and direct.`;
      break;

    case "high_school":
      systemPrompt = `
Dont do an introduction . You're a smart, clear high school tutor.
You can use technical language but still explain things step-by-step.
Write in structured HTML format (<p>, <ul>, <strong>).
No markdown. Keep it focused, engaging, and easy to understand.
No filler or polite fluff. Jump into the content with clarity.`;
      break;

    case "university":
      systemPrompt = `
Dont do an introduction . You are a concise, detail-oriented college-level tutor.
Use precise academic language and go into deeper detail when needed.
Format all responses in clear HTML using <p>, <ul>, and <strong>.
Avoid markdown and avoid fluff. Do not include polite greetings or intro phrases.
Stay focused and use examples when necessary.`;
      break;

    default:
      systemPrompt = `
Dont do an introduction. You are a helpful and concise tutor.
Format answers using HTML tags like <p>, <ul>, and <strong>.
Avoid markdown, filler phrases, and long paragraphs.`;
      break;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt.trim()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192"
    });

    const answer = response.choices[0]?.message?.content || "No response.";
    res.json({ answer });
  } catch (err) {
    console.error("Groq API Error:", err);
    res.status(500).json({ error: "AI request failed." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
