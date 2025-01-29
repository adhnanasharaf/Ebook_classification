import express from 'express';
import db from '../db/database';
import { Book } from '../models/Book';

const router = express.Router();

interface DBBook {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  tags: string | null;
}

// Get all books
router.get('/', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows: DBBook[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const books: Book[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      excerpt: row.excerpt,
      tags: row.tags ? row.tags.split(',') : []
    }));
    res.json(books);
  });
});

// Add sample books for testing
router.post('/sample', (req, res) => {
  const sampleBooks: Book[] = [
    {
      title: "The Stranger",
      author: "Albert Camus",
      excerpt: "Mother died today. Or maybe yesterday, I don't know...",
      tags: ["existentialism", "philosophy", "fiction"]
    },
    {
      title: "Thus Spoke Zarathustra",
      author: "Friedrich Nietzsche",
      excerpt: "When Zarathustra was thirty years old...",
      tags: ["philosophy", "existentialism"]
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      excerpt: "A beginning is the time for taking the most delicate care that the balances are correct...",
      tags: ["science fiction,fantasy,classics"]
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      excerpt: "Far out in the uncharted backwaters of the unfashionable end of the Western Spiral arm of the Galaxy...",
      tags: ["science fiction", "humor", "adventure"]
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      excerpt: "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow...",
      tags: ["classics", "fiction", "literature"]
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      excerpt: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since...",
      tags: ["classics", "fiction", "romance"]
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      excerpt: "A squat grey building of only thirty-four stories. Over the main entrance the words...",
      tags: ["dystopian", "science fiction", "classics"]
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      excerpt: "If you really want to hear about it, the first thing you'll probably want to know is where I was born...",
      tags: ["fiction", "classics", "coming-of-age"]
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      excerpt: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole...",
      tags: ["fantasy", "adventure", "classics"]
    },
    {
      title: "One Hundred Years of Solitude",
      author: "Gabriel García Márquez",
      excerpt: "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon...",
      tags: ["magical realism", "literary fiction", "classics"]
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO books (title, author, excerpt, tags)
    VALUES (?, ?, ?, ?)
  `);

  sampleBooks.forEach(book => {
    stmt.run(
      book.title,
      book.author,
      book.excerpt,
      book.tags?.join(',')
    );
  });

  stmt.finalize();
  res.json({ message: 'Sample books added' });
});

export default router; 