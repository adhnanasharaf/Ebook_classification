// import express from 'express';
// import db from '../db/database';
// import { Book } from '../models/Book';

// const router = express.Router();

// interface DBBook {
//   id: number;
//   title: string;
//   author: string;
//   excerpt: string;
//   tags: string | null;
// }

// // Get all books
// router.get('/', (req, res) => {
//   db.all('SELECT * FROM books', [], (err, rows: DBBook[]) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     const books: Book[] = rows.map(row => ({
//       id: row.id,
//       title: row.title,
//       author: row.author,
//       excerpt: row.excerpt,
//       tags: row.tags ? row.tags.split(',') : []
//     }));
//     res.json(books);
//   });
// });

// // Add sample books for testing
// router.post('/sample', (req, res) => {
//   const sampleBooks: Book[] = [
//     {
//       title: "The Stranger",
//       author: "Albert Camus",
//       excerpt: "Mother died today. Or maybe yesterday, I don't know...",
//       tags: ["existentialism", "philosophy", "fiction"]
//     },
//     {
//       title: "Thus Spoke Zarathustra",
//       author: "Friedrich Nietzsche",
//       excerpt: "When Zarathustra was thirty years old...",
//       tags: ["philosophy", "existentialism"]
//     },
//     {
//       title: "Dune",
//       author: "Frank Herbert",
//       excerpt: "A beginning is the time for taking the most delicate care that the balances are correct...",
//       tags: ["science fiction,fantasy,classics"]
//     },
//     {
//       title: "The Hitchhiker's Guide to the Galaxy",
//       author: "Douglas Adams",
//       excerpt: "Far out in the uncharted backwaters of the unfashionable end of the Western Spiral arm of the Galaxy...",
//       tags: ["science fiction", "humor", "adventure"]
//     },
//     {
//       title: "To Kill a Mockingbird",
//       author: "Harper Lee",
//       excerpt: "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow...",
//       tags: ["classics", "fiction", "literature"]
//     },
//     {
//       title: "The Great Gatsby",
//       author: "F. Scott Fitzgerald",
//       excerpt: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since...",
//       tags: ["classics", "fiction", "romance"]
//     },
//     {
//       title: "Brave New World",
//       author: "Aldous Huxley",
//       excerpt: "A squat grey building of only thirty-four stories. Over the main entrance the words...",
//       tags: ["dystopian", "science fiction", "classics"]
//     },
//     {
//       title: "The Catcher in the Rye",
//       author: "J.D. Salinger",
//       excerpt: "If you really want to hear about it, the first thing you'll probably want to know is where I was born...",
//       tags: ["fiction", "classics", "coming-of-age"]
//     },
//     {
//       title: "The Hobbit",
//       author: "J.R.R. Tolkien",
//       excerpt: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole...",
//       tags: ["fantasy", "adventure", "classics"]
//     },
//     {
//       title: "One Hundred Years of Solitude",
//       author: "Gabriel García Márquez",
//       excerpt: "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon...",
//       tags: ["magical realism", "literary fiction", "classics"]
//     }
//   ];

//   const stmt = db.prepare(`
//     INSERT INTO books (title, author, excerpt, tags)
//     VALUES (?, ?, ?, ?)
//   `);

//   sampleBooks.forEach(book => {
//     stmt.run(
//       book.title,
//       book.author,
//       book.excerpt,
//       book.tags?.join(',')
//     );
//   });

//   stmt.finalize();
//   res.json({ message: 'Sample books added' });
// });

// export default router; 

import express from 'express';
import db from '../db/database';
import { Book } from '../models/Book';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Constants
const OLLAMA_API_URL = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'llama3.2';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000;
const MIN_OLLAMA_VERSION = '0.5.0';

interface ProcessedBook {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  tags: string[];
  processed_at: string;
}

// Version check function
async function checkOllamaVersion(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/version`);
    const version = response.data.version;
    console.log('Ollama version:', version);
    return version >= MIN_OLLAMA_VERSION;
  } catch (error) {
    console.error('Failed to check Ollama version:', error);
    return false;
  }
}

// Get all books
router.get('/', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const books = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      excerpt: row.excerpt,
      tags: row.tags ? row.tags.split(',') : [],
      processed_at: row.processed_at
    }));
    res.json(books);
  });
});

// Delete all books
router.delete('/all', (req, res) => {
  db.run('DELETE FROM books', [], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'All books deleted successfully' });
  });
});

// Helper function to get category tags from Ollama
async function getOllamaCategoryTags(summary: string): Promise<string[]> {
  try {
    console.log('\nProcessing summary:', summary);

    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: `You are a book categorizer. For the following book summary, provide exactly 2 category tags.
              Respond ONLY with the tags separated by commas. No other text.
              Make the tags broad enough to be useful for categorization.
              Summary: "${summary}"`,
      stream: false,
      options: {
        temperature: 0.7,
        top_k: 50,
        top_p: 0.95,
      }
    });

    const categories = response.data.response
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    console.log('Categories:', categories);
    return categories;

  } catch (error: any) {
    console.error('Error getting categories:', error.message);
    return ['Uncategorized'];
  }
}

// Fetch books from Gutendex and categorize them
router.post('/fetch', async (req, res) => {
  try {
    // Check Ollama version and connection
    const isVersionValid = await checkOllamaVersion();
    if (!isVersionValid) {
      throw new Error('Incompatible or unavailable Ollama version');
    }

    console.log('Fetching books from Gutendex...');
    const response = await axios.get('https://gutendex.com/books');
    const books = response.data.results;
    
    console.log(`Found ${books.length} books to process`);
    const processedBooks: ProcessedBook[] = [];

    // Process each book with a delay between requests
    for (const book of books) {
      console.log('\n-----------------------------------');
      console.log(`Processing book: "${book.title}"`);
      
      const excerpt = book.summaries?.length
        ? book.summaries[0].split('. ')[0] + '.'
        : book.title;

      try {
        // Get categories from Ollama
        const tags = await getOllamaCategoryTags(excerpt);
        
        const processedBook: ProcessedBook = {
          id: book.id,
          title: book.title,
          author: book.authors[0]?.name || 'Unknown Author',
          excerpt: excerpt,
          tags: tags,
          processed_at: new Date().toISOString()
        };

        console.log('Successfully processed book:', {
          title: processedBook.title,
          author: processedBook.author,
          tags: processedBook.tags
        });

        // Save to database
        const stmt = db.prepare(`
          INSERT INTO books (title, author, excerpt, tags, processed_at)
          VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(
          processedBook.title,
          processedBook.author,
          processedBook.excerpt,
          processedBook.tags.join(','),
          processedBook.processed_at
        );

        stmt.finalize();
        processedBooks.push(processedBook);

      } catch (error) {
        console.error(`Error processing book "${book.title}":`, error);
      }

      // Add delay between processing books (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n-----------------------------------');
    console.log(`Completed processing ${processedBooks.length} books`);

    // Return processed books
    res.json({ 
      total_processed: processedBooks.length,
      books: processedBooks.map(book => ({
        title: book.title,
        author: book.author,
        excerpt: book.excerpt,
        tags: book.tags,
        processed_at: book.processed_at
      }))
    });

  } catch (error: any) {
    console.error('Error in book processing:', error);
    res.status(500).json({ 
      error: 'Failed to process books',
      message: error.message 
    });
  }
});

export default router;