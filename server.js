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
  const prompt = req.body.prompt;
  console.log("Received prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided." });
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful and concise tutor. 
Avoid filler phrases like "I'm happy to help" or "Let's dive in."
Format your answer using clear HTML, like:
<p>paragraphs</p>, <strong>bold</strong>, and <ul><li>bullet points</li></ul> instead of asterisk.
Avoid markdown and walls of text. Keep explanations easy to scan. Simply answer the question without unnecessary details, then at the end you can ask the user if they want to be explained with specifics.`
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
