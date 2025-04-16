require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

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
                CREATE TABLE IF NOT EXISTS books (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    image VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
      console.log("✅ MySQL Books Table Created/Checked");

      await connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    -- Add other user fields like password, email, etc.
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
      console.log("✅ MySQL Users Table Created/Checked");

      await connection.execute(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    book_id INT NOT NULL,
                    quantity INT NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (book_id) REFERENCES books(id),
                    UNIQUE KEY user_book (user_id, book_id)
                )
            `);
      console.log("✅ MySQL Cart Items Table Created/Checked");

      await connection.execute(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    address TEXT NOT NULL,
                    payment_method VARCHAR(50) NOT NULL,
                    total_amount DECIMAL(10, 2) NOT NULL,
                    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
      console.log("✅ MySQL Orders Table Created/Checked");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
    process.exit(1);
  }
}

initializeDatabase();

// --- Book Endpoints ---

// Get all books (for the "arrivals" section)
app.get("/api/arrivals", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM books ORDER BY created_at DESC"
      );
      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error fetching arrivals:", error);
    res.status(500).json({ error: "Failed to fetch new arrivals." });
  }
});

// --- Cart Endpoints ---

// Get user's cart items
app.get("/api/cart/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID." });
  }
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `
                SELECT
                    cart_items.book_id,
                    cart_items.quantity,
                    books.name,
                    books.price,
                    books.image
                FROM cart_items
                JOIN books ON cart_items.book_id = books.id
                WHERE cart_items.user_id = ?
            `,
        [userId]
      );

      const itemsWithSubtotal = rows.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      }));

      const total = itemsWithSubtotal.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      res.json({ items: itemsWithSubtotal, total: total });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});

// Add a book to the cart
app.post("/api/cart/add", async (req, res) => {
  const { userId, bookId } = req.body;
  if (!userId || !bookId) {
    return res.status(400).json({ error: "Missing user ID or book ID." });
  }
  try {
    const connection = await pool.getConnection();
    try {
      // Check if the book exists
      const [bookExists] = await connection.execute(
        "SELECT id FROM books WHERE id = ?",
        [bookId]
      );
      if (bookExists.length === 0) {
        return res.status(404).json({ error: "Book not found." });
      }

      // Check if the item is already in the cart
      const [existingItem] = await connection.execute(
        "SELECT quantity FROM cart_items WHERE user_id = ? AND book_id = ?",
        [userId, bookId]
      );

      if (existingItem.length > 0) {
        // Increment quantity if it exists
        await connection.execute(
          "UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND book_id = ?",
          [userId, bookId]
        );
        res.status(200).json({ message: "Cart updated." });
      } else {
        // Add new item to cart
        await connection.execute(
          "INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, 1)",
          [userId, bookId]
        );
        res.status(201).json({ message: "Book added to cart." });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart." });
  }
});

// Update cart item quantity
app.put("/api/cart/update", async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  if (!userId || !bookId || !quantity || quantity < 1) {
    return res
      .status(400)
      .json({ error: "Invalid request for updating cart." });
  }
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?",
        [quantity, userId, bookId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Cart updated." });
      } else {
        res.status(404).json({ error: "Cart item not found." });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart." });
  }
});

// Remove item from cart
app.delete("/api/cart/remove", async (req, res) => {
  const { userId, bookId } = req.body;
  if (!userId || !bookId) {
    return res.status(400).json({ error: "Missing user ID or book ID." });
  }
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "DELETE FROM cart_items WHERE user_id = ? AND book_id = ?",
        [userId, bookId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Item removed from cart." });
      } else {
        res.status(404).json({ error: "Cart item not found." });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    res.status(500).json({ error: "Failed to remove from cart." });
  }
});

// --- Order Endpoint (as provided) ---
// app.post("/api/checkout", async (req, res) => {
//   const { userId, name, address, paymentMethod, totalAmount } = req.body;

//   if (
//     !userId ||
//     !name ||
//     !address ||
//     !paymentMethod ||
//     totalAmount === undefined
//   ) {
//     return res
//       .status(400)
//       .json({ error: "Missing required checkout information." });
//   }

//   try {
//     const connection = await pool.getConnection();
//     try {
//       // Basic validation to ensure user exists (you might have more robust auth)
//       const [userExists] = await connection.execute(
//         "SELECT id FROM users WHERE id = ?",
//         [userId]
//       );
//       if (userExists.length === 0) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       // Insert the order details into the database
//       const [result] = await connection.execute(
//         "INSERT INTO orders (user_id, full_name, address, payment_method, total_amount) VALUES (?, ?, ?, ?, ?)",
//         [userId, name, address, paymentMethod, totalAmount]
//       );

//       if (result.insertId) {
//         // Clear the user's shopping cart after successful order
//         await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [
//           userId,
//         ]);

//         res.status(201).json({
//           message: "Order placed successfully!",
//           orderId: result.insertId,
//         });
//         // In a real application, you might also:
//         // - Send a confirmation email to the user
//       } else {
//         res.status(500).json({ error: "Failed to place order." });
//       }
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error("❌ Error placing order:", error);
//     res.status(500).json({ error: "Failed to place order." });
//   }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
