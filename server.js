const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change this if you have a different user
  password: "root", // Change this if you have a database password
  database: "book",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Get all books
app.get("/api/books", (req, res) => {
  const sql = "SELECT * FROM books";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching books:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(result);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
