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
    console.log("MySQL Connection Pool Created");

    const connection = await pool.getConnection();
    try {
      // Create books table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create users table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create cart_items table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          book_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (book_id) REFERENCES books(id),
          UNIQUE KEY user_book (user_id, book_id)
        )
      `);
      console.log("MySQL Tables Created/Checked");

      // Add some sample books if none exist
      const [books] = await connection.execute(
        "SELECT COUNT(*) as count FROM books"
      );
      if (books[0].count === 0) {
        await connection.execute(`
          INSERT INTO books (name, price, image) VALUES
          ('The Great Novel', 12.99, 'book1.jpg'),
          ('Science Encyclopedia', 24.99, 'book2.jpg'),
          ('History of the World', 19.99, 'book3.jpg')
        `);
      }

      // Add a sample user if none exists
      const [users] = await connection.execute(
        "SELECT COUNT(*) as count FROM users"
      );
      if (users[0].count === 0) {
        await connection.execute(`
          INSERT INTO users (username, email) VALUES
          ('testuser', 'user@example.com')
        `);
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("MySQL Connection Error:", error);
    process.exit(1);
  }
}

initializeDatabase();

// Helper function to get book details
async function getBookDetails(bookId) {
  const [rows] = await pool.execute(
    "SELECT id, name, price, image FROM books WHERE id = ?",
    [bookId]
  );
  return rows[0];
}

// Get user's cart
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId))
      return res.status(400).json({ error: "Invalid user ID" });

    const [cartItems] = await pool.execute(
      "SELECT book_id, quantity FROM cart_items WHERE user_id = ?",
      [userId]
    );

    const cartWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const book = await getBookDetails(item.book_id);
        return {
          id: book.id,
          name: book.name,
          price: book.price,
          quantity: item.quantity,
          image: book.image,
          subtotal: book.price * item.quantity,
        };
      })
    );

    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ items: cartWithDetails, total });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add to cart
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, bookId, quantity = 1 } = req.body;
    if (!userId || !bookId)
      return res.status(400).json({ error: "Missing required fields" });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if item already in cart
      const [existing] = await connection.execute(
        "SELECT quantity FROM cart_items WHERE user_id = ? AND book_id = ?",
        [userId, bookId]
      );

      if (existing.length > 0) {
        const newQty = existing[0].quantity + quantity;
        await connection.execute(
          "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?",
          [newQty, userId, bookId]
        );
      } else {
        await connection.execute(
          "INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)",
          [userId, bookId, quantity]
        );
      }

      await connection.commit();
      res.status(200).json({ message: "Item added to cart" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Update cart item quantity
app.put("/api/cart/update", async (req, res) => {
  try {
    const { userId, bookId, quantity } = req.body;
    if (!userId || !bookId || !quantity)
      return res.status(400).json({ error: "Missing required fields" });

    const [result] = await pool.execute(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?",
      [quantity, userId, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json({ message: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove from cart
app.delete("/api/cart/remove", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId)
      return res.status(400).json({ error: "Missing required fields" });

    const [result] = await pool.execute(
      "DELETE FROM cart_items WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Define the /api/blogs endpoint
app.get("/api/blogs", async (req, res) => {
  try {
    // Replace this with your actual logic to fetch blogs from your database
    const [blogs] = await pool.execute(`
      SELECT
        id,
        title,
        content,
        author,
        image
      FROM
        blogs_table; -- Replace 'blogs_table' with the actual name of your blogs table
    `);
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🛒 Cart API and Blogs API running on port ${PORT}`)
);
