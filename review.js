require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // Use the promise-based library
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const dbConfig = {
  host: "localhost", // Your MySQL host
  user: "root", // Your MySQL username
  password: "root", // Your MySQL password
  database: "bookstore", // Your MySQL database name
};

async function connectToDatabase() {
  try {
    const pool = mysql.createPool(dbConfig); // Create a connection pool
    console.log("Connected to MySQL database");
    return pool;
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    process.exit(1); // Exit the process if the database connection fails
    return null;
  }
}

let databasePool;

connectToDatabase().then((pool) => {
  databasePool = pool;

  app.get("/api/reviews", async (req, res) => {
    try {
      const [rows] = await databasePool.execute("SELECT * FROM reviews"); // Use pool.execute for promises
      res.json(rows);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app.get("/api/search", (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    const sql = "SELECT * FROM books WHERE title LIKE ? OR author LIKE ?";
    const searchTerm = `%${query}%`;
    db.query(sql, [searchTerm, searchTerm], (err, results) => {
      if (err) {
        console.error("Error searching books:", err);
        res.status(500).json({ error: "Failed to search books" });
        return;
      }
      res.json(results);
    });
  });

  const port = process.env.PORT || 3001; // Use environment variable for port if available
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
