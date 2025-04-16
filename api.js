require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_DATABASE || "bookstore",
      waitForConnections: true,
      connectionLimit: 10,
      queueTimeout: 0,
    });
    console.log("✅ MySQL Connection Pool Created");

    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ MySQL Users Table Created/Checked");

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          session_id VARCHAR(255) PRIMARY KEY,
          user_id INT NOT NULL,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      console.log("✅ MySQL Chat Sessions Table Created/Checked");

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          message_id INT AUTO_INCREMENT PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          sender ENUM('You', 'TAL AI') NOT NULL,
          text TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
        )
      `);
      console.log("✅ MySQL Chat Messages Table Created/Checked");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
    process.exit(1);
  }
}

initializeDatabase();

app.post("/api/chat", async (req, res) => {
  const { userId, userMessage, sessionId } = req.body;

  if (!userId || !userMessage || !userMessage.trim()) {
    return res.status(400).json({ error: "User ID and message are required." });
  }

  const systemPrompt = "You are a helpful travel agent. Be descriptive and informative.";
  const endpoint = process.env.AIML_API_ENDPOINT || "https://api.aimlapi.com/v1/chat/completions";
  const apiKey = process.env.AIML_API_KEY;

  if (!apiKey) {
    console.error("❌ AIML_API_KEY is not set in the environment variables.");
    return res.status(500).json({ error: "AI service configuration error." });
  }

  try {
    const aiApiResponse = await axios.post(
      endpoint,
      {
        model: process.env.AIML_API_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: parseFloat(process.env.AIML_API_TEMPERATURE || "0.7"),
        max_tokens: parseInt(process.env.AIML_API_MAX_TOKENS || "256"),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = aiApiResponse.data.choices?.[0]?.message?.content || "I'm still learning.";

    const connection = await pool.getConnection();
    try {
      const [userExists] = await connection.execute("SELECT id FROM users WHERE id = ?", [userId]);
      if (userExists.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = crypto.randomBytes(16).toString("hex");
        await connection.execute("INSERT INTO chat_sessions (session_id, user_id) VALUES (?, ?)", [currentSessionId, userId]);
      } else {
        const [sessionExists] = await connection.execute(
          "SELECT session_id FROM chat_sessions WHERE session_id = ? AND user_id = ?",
          [currentSessionId, userId]
        );
        if (sessionExists.length === 0) {
          return res.status(400).json({ error: "Invalid sessionId for this user." });
        }
      }

      await connection.execute("INSERT INTO chat_messages (session_id, sender, text) VALUES (?, ?, ?)", [currentSessionId, "You", userMessage]);
      await connection.execute("INSERT INTO chat_messages (session_id, sender, text) VALUES (?, ?, ?)", [currentSessionId, "TAL AI", aiResponse]);

      res.json({ aiResponse, sessionId: currentSessionId });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ AI API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.get("/api/chat/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await pool.getConnection();
    try {
      const [userExists] = await connection.execute("SELECT id FROM users WHERE id = ?", [userId]);
      if (userExists.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      const [sessions] = await connection.execute(
        `SELECT s.session_id, s.start_time,
                (SELECT cm.text FROM chat_messages cm
                 WHERE cm.session_id = s.session_id AND cm.sender = 'You'
                 ORDER BY cm.timestamp ASC LIMIT 1) AS first_user_message
         FROM chat_sessions s
         WHERE s.user_id = ?
         ORDER BY s.start_time DESC`,
        [userId]
      );

      const sessionList = sessions.map((session) => ({
        sessionId: session.session_id,
        startTime: session.start_time,
        summary: session.first_user_message?.substring(0, 50) + "..." || "New Chat",
      }));

      res.json(sessionList);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ MySQL Error:", error);
    res.status(500).json({ error: "Failed to retrieve chat sessions." });
  }
});

app.get("/api/chat/:userId/:sessionId", async (req, res) => {
  const { userId, sessionId } = req.params;

  try {
    const connection = await pool.getConnection();
    try {
      const [userExists] = await connection.execute("SELECT id FROM users WHERE id = ?", [userId]);
      if (userExists.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      const [sessionExists] = await connection.execute(
        "SELECT session_id FROM chat_sessions WHERE session_id = ? AND user_id = ?",
        [sessionId, userId]
      );
      if (sessionExists.length === 0) {
        return res.status(404).json({ error: "Session not found for this user." });
      }

      const [messages] = await connection.execute(
        `SELECT sender, text, timestamp FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC`,
        [sessionId]
      );

      res.json(messages);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ MySQL Error:", error);
    res.status(500).json({ error: "Failed to retrieve session messages." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
