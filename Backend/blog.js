require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"], // Allow both origins for development
    credentials: true,
  })
);

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
        CREATE TABLE IF NOT EXISTS books (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          author VARCHAR(100),
          price DECIMAL(10, 2),
          image VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ MySQL Books Table Created/Checked");

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS blogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          author VARCHAR(100),
          image VARCHAR(255),
          link VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ MySQL Blogs Table Created/Checked");

      const [existingBlogs] = await connection.execute(
        "SELECT COUNT(*) as count FROM blogs"
      );
      if (existingBlogs[0].count === 0) {
        const initialBlogs = [
          {
            title: "The Power of Books",
            content:
              "Books are incredibly beneficial for personal growth. Reading sharpens the mind and expands knowledge. Most successful people have a habit of daily reading.",
            author: "John Doe",
            image: "image/blog-1.jpg",
            link: "https://sourcesofinsight.com/the-power-of-books/",
          },
          {
            title: "Why Reading Matters",
            content:
              "Reading enhances creativity and helps in developing critical thinking skills. A good book can change your perspective on life.",
            author: "Emily Smith",
            image: "image/blog-2.jpg",
            link: "https://www.lilipadlibrary.org/blog/why-reading-matters",
          },
          {
            title: "Best Books for Self-Improvement",
            content:
              "Looking for self-improvement books? Here's a list of must-read books that will help you grow mentally and emotionally.",
            author: "Michael Brown",
            image: "image/blog-3.jpg",
            link: "https://divbyzero.com/blog/personal-growth-books/",
          },
        ];
        for (const blog of initialBlogs) {
          await connection.execute(
            "INSERT INTO blogs (title, content, author, image, link) VALUES (?, ?, ?, ?, ?)",
            [blog.title, blog.content, blog.author, blog.image, blog.link]
          );
        }
        console.log("✅ Initial blog data added");
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
    process.exit(1);
  }
}

initializeDatabase();

// Get all blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM blogs");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

// Get single blog by ID
app.get("/api/blogs/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM blogs WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ message: "Failed to fetch blog." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`📚 Book Store backend running on port ${PORT}`)
);
