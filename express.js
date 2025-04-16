const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample book data
const booksDB = [
  { title: 'Dune', genre: 'science fiction' },
  { title: '1984', genre: 'dystopian' },
  { title: 'Pride and Prejudice', genre: 'romance' },
  { title: 'The Hobbit', genre: 'fantasy' },
  { title: 'Sapiens', genre: 'history' },
  { title: 'The Great Gatsby', genre: 'classic' },
];

// Helper function to filter books
function getBooksByGenre(message) {
  const genre = message.toLowerCase();
  return booksDB
    .filter(book => genre.includes(book.genre))
    .map(book => book.title);
}

// API route
app.post('/chat', (req, res) => {
  const userMessage = req.body.message || '';

  if (!userMessage) {
    return res.json({ reply: "Please provide a message." });
  }

  const matchedBooks = getBooksByGenre(userMessage);

  if (matchedBooks.length > 0) {
    return res.json({
      reply: `Based on your interest, here are some books: ${matchedBooks.join(', ')}.`
    });
  } else {
    return res.json({ reply: "Sorry, I couldn't find books matching your interest. Try a different genre." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
