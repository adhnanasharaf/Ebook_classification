import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import db from './db/database';  // Import the database

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/books', booksRouter);

// Database initialization check
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='books'", (err, row) => {
  if (err) {
    console.error('Error checking database:', err);
    return;
  }
  console.log('Database initialized:', row ? 'books table exists' : 'books table created');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});