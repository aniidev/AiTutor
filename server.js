import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Groq } from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import './google.js';

import { GetListByKeyword } from "youtube-search-api";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessions = new Map(); // Stores chat histories

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/"
}), (req, res) => {
  res.redirect("/index.html");
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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
No polite phrases like "I'm happy to help" or "Of course" — just jump into the fun!`;
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
async function getYouTubeVideoUrl(query) {
  try {
    const results = await GetListByKeyword(query, false, 1);
    const videoId = results.items?.[0]?.id;
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  } catch (err) {
    console.error("YouTube Search Error:", err);
    return null;
  }
}

app.post("/api/ask", async (req, res) => {
  const { prompt, ageLevel, sessionId, makeSim } = req.body;
  if (!prompt || !sessionId) return res.status(400).json({ error: "Invalid request" });

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
  session.history.push({ role: "user", content: prompt });
    
  try {


    const response = await groq.chat.completions.create({
      messages: session.history,
      model: "llama3-8b-8192"
    });
 
    const answer = response.choices[0]?.message?.content || "No response.";
    
    session.history.push({ role: "assistant", content: answer });
    let p5Sketch = null;

    if (makeSim) {
      try {
        const sketchResponse = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are an expert p5.js developer. Generate complete and clean 400x400 p5.js simulations using setup() and draw(). Your code must work without errors in the p5.js web editor. Do not include HTML or explanations. Always define variables. Keep the Circle class, background(35), and replay button intact. Animations should be smooth and visually intuitive.`
            },
            {
              role: "user",
              content: ` Create a p5.js simulation that visually demonstrates the following concept:\n\n"${prompt}"\n\n Here is the code structure you MUST follow:
        
        // Base sketch structure - only add logic
        let circleObj;
        function setup() {
          // circleObj must be initialized here
          circleObj = new Circle(200, 200, 20);
          createCanvas(400, 400);
          replayButton = createButton('Replay'); // keep this
          replayButton.position(10, 10);
          replayButton.mousePressed(reset); // fix this reference
        }
        
        function draw() {
          background(35); // keep this
          circleObj.display();
          // Add simulation logic here
        }
        
        function reset() {
          // Add logic to reset state here
        }
        
        class Circle {
          constructor(x, y, r) {
            this.x = x;
            this.y = y;
            this.r = r;
            // Add more properties as needed
          }
        
          display() {
            fill(255);
            noStroke();
            ellipse(this.x, this.y, this.r * 2);
          }
        
          // Add other behavior methods here
        }
        
        // Add any necessary global variables
        DO NOT HAVE ANY INTRODUCTIONS OR ANYTHING DO NOT SAY HERE IS THE CODE JUST ONLY OUTPUT THE CODE NO EXTRA SYMBOLS OR CODE FENCES (NO \`\`\` or \`\`\`javascript )OR ANYTHING ONLY P5.js code ` }
          ],
          model: "llama3-8b-8192"
        });
        p5Sketch = sketchResponse.choices[0]?.message?.content || null;

        // Clean code if it's in a code block
        const match = p5Sketch.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
        if (match) p5Sketch = match[1];
      } catch (err) {
        console.error("Sketch generation failed:", err);
      }
}
    cleanupSessions();
    const videoUrl = await getYouTubeVideoUrl(prompt);
    res.json({ answer, videoUrl, p5Sketch });
    
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
