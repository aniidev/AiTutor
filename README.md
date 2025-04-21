Personalized Learning Assistant
Tutor AI is an interactive web app that lets users learn academic subjects through AI-powered tutoring, tailored to their grade level — from kid to university. Built with a clean interface and level-based explanations, it makes learning fun, friendly, and effective.

🚀 Features
🎓 Select subject and learning level (Kid, Middle School, High School, University)

💬 Chat interface for real-time AI Q&A

🔍 Optional step-by-step explanations

✨ Age-appropriate responses using Groq + LLaMA 3

📱 Mobile-friendly design (HTML + CSS + JS)

🔐 API key stored securely via .env

🛠️ Tech Stack
Frontend: HTML, CSS, Vanilla JS

Backend: Node.js, Express.js

AI Model: Groq API using llama3-8b-8192

Hosting: Local or Deploy with Vercel/Render

Other: dotenv, body-parser, cors

📦 Installation
bash
Copy code
git clone https://github.com/your-username/conceptia-ai.git
cd conceptia-ai
npm install
Create a .env file in the root directory:

ini
Copy code
GROQ_API_KEY=your_groq_api_key
🧑‍💻 Run Locally
bash
Copy code
npm start
Visit: http://localhost:3000

📁 Project Structure
pgsql
Copy code
/public
  index.html
  script.js
  style.css
server.js
.env
🧪 Example Prompt
Subject: Math
Level: Kid
Prompt: What is adding?

AI Response:

html
Copy code
<p>Adding means putting things together to make more! ➕</p>
<p>Like if you have <strong>2 cookies</strong> 🍪 and your friend gives you <strong>1 more</strong>... now you have <strong>3 cookies</strong>! 🍪🍪🍪</p>
💡 Future Plans
Add voice input and text-to-speech

Save user Q&A history

Multi-language support

Dynamic subject modules
