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
//       excerpt: "Far out in the uncharted backwaters of the Western Spiral arm of the Galaxy...",
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



//////////////////////////////////////////////////////////////

// import express from 'express';
// import db from '../db/database';
// import { Book } from '../models/Book';
// import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();

// // Constants
// const OLLAMA_API_URL = 'http://127.0.0.1:11434';
// const OLLAMA_MODEL = 'llama3.2';
// const MAX_RETRIES = 3;
// const INITIAL_BACKOFF = 2000;
// const MIN_OLLAMA_VERSION = '0.5.0';

// interface ProcessedBook {
//   id: number;
//   title: string;
//   author: string;
//   excerpt: string;
//   tags: string[];
//   processed_at: string;
// }

// // Version check function
// async function checkOllamaVersion(): Promise<boolean> {
//   try {
//     const response = await axios.get(`${OLLAMA_API_URL}/api/version`);
//     const version = response.data.version;
//     console.log('Ollama version:', version);
//     return version >= MIN_OLLAMA_VERSION;
//   } catch (error) {
//     console.error('Failed to check Ollama version:', error);
//     return false;
//   }
// }

// // Get all books
// router.get('/', (req, res) => {
//   db.all('SELECT * FROM books', [], (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     const books = rows.map((row: any) => ({
//       id: row.id,
//       title: row.title,
//       author: row.author,
//       excerpt: row.excerpt,
//       tags: row.tags ? row.tags.split(',') : [],
//       processed_at: row.processed_at
//     }));
//     res.json(books);
//   });
// });

// // Delete all books
// router.delete('/all', (req, res) => {
//   db.run('DELETE FROM books', [], (err) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ message: 'All books deleted successfully' });
//   });
// });

// // Helper function to get category tags from Ollama
// async function getOllamaCategoryTags(summary: string): Promise<string[]> {
//   try {
//     console.log('\nProcessing summary:', summary);

//     const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
//       model: OLLAMA_MODEL,
//       prompt: `You are a book categorizer. For the following book summary, provide exactly 2 category tags.
//               Respond ONLY with the tags separated by commas. No other text.
//               Make the tags broad enough to be useful for categorization.
//               Summary: "${summary}"`,
//       stream: false,
//       options: {
//         temperature: 0.7,
//         top_k: 50,
//         top_p: 0.95,
//       }
//     });

//     const categories = response.data.response
//       .split(',')
//       .map((tag: string) => tag.trim())
//       .filter((tag: string) => tag.length > 0);

//     console.log('Categories:', categories);
//     return categories;

//   } catch (error: any) {
//     console.error('Error getting categories:', error.message);
//     return ['Uncategorized'];
//   }
// }

// // Fetch books from Gutendex and categorize them
// router.post('/fetch', async (req, res) => {
//   try {
//     // Check Ollama version and connection
//     const isVersionValid = await checkOllamaVersion();
//     if (!isVersionValid) {
//       throw new Error('Incompatible or unavailable Ollama version');
//     }

//     console.log('Fetching books from Gutendex...');
//     const response = await axios.get('https://gutendex.com/books');
//     const books = response.data.results;
    
//     console.log(`Found ${books.length} books to process`);
//     const processedBooks: ProcessedBook[] = [];

//     // Process each book with a delay between requests
//     for (const book of books) {
//       console.log('\n-----------------------------------');
//       console.log(`Processing book: "${book.title}"`);
      
//       const excerpt = book.summaries?.length
//         ? book.summaries[0].split('. ')[0] + '.'
//         : book.title;

//       try {
//         // Get categories from Ollama
//         const tags = await getOllamaCategoryTags(excerpt);
        
//         const processedBook: ProcessedBook = {
//           id: book.id,
//           title: book.title,
//           author: book.authors[0]?.name || 'Unknown Author',
//           excerpt: excerpt,
//           tags: tags,
//           processed_at: new Date().toISOString()
//         };

//         console.log('Successfully processed book:', {
//           title: processedBook.title,
//           author: processedBook.author,
//           tags: processedBook.tags
//         });

//         // Save to database
//         const stmt = db.prepare(`
//           INSERT INTO books (title, author, excerpt, tags, processed_at)
//           VALUES (?, ?, ?, ?, ?)
//         `);

//         stmt.run(
//           processedBook.title,
//           processedBook.author,
//           processedBook.excerpt,
//           processedBook.tags.join(','),
//           processedBook.processed_at
//         );

//         stmt.finalize();
//         processedBooks.push(processedBook);

//       } catch (error) {
//         console.error(`Error processing book "${book.title}":`, error);
//       }

//       // Add delay between processing books (3 seconds)
//       await new Promise(resolve => setTimeout(resolve, 3000));
//     }

//     console.log('\n-----------------------------------');
//     console.log(`Completed processing ${processedBooks.length} books`);

//     // Return processed books
//     res.json({ 
//       total_processed: processedBooks.length,
//       books: processedBooks.map(book => ({
//         title: book.title,
//         author: book.author,
//         excerpt: book.excerpt,
//         tags: book.tags,
//         processed_at: book.processed_at
//       }))
//     });

//   } catch (error: any) {
//     console.error('Error in book processing:', error);
//     res.status(500).json({ 
//       error: 'Failed to process books',
//       message: error.message 
//     });
//   }
// });

// export default router;

//////////////////////////////////////////////////////////////




// import express from 'express';
// import db from '../db/database';
// import fs from 'fs';
// import path from 'path';
// import { parse } from 'epub-parser';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import { XMLHttpRequest } from 'xmlhttprequest';
// import fetch from 'node-fetch';
// import Epub from 'epub2'; // Install with `npm install epub2`

// dotenv.config();

// const router = express.Router();

// const OLLAMA_API_URL = 'http://127.0.0.1:11434';
// const OLLAMA_MODEL = 'llama3.2';
// const BOOKS_DIR = path.resolve('/Users/adhnan/Calibre Library');

// interface ProcessedBook {
//   id: number;
//   title: string;
//   author: string;
//   path: string;
//   excerpt: string;
//   tags: string[];
//   processed_at: string;
// }

// // Helper to traverse directories and find EPUB files with author and title
// async function getEpubPaths(): Promise<{ title: string; author: string; path: string }[]> {
//   const epubPaths: { title: string; author: string; path: string }[] = [];

//   const authors = fs.readdirSync(BOOKS_DIR);

//   authors.forEach((author) => {
//     const authorPath = path.join(BOOKS_DIR, author);
//     if (fs.statSync(authorPath).isDirectory()) {
//       const books = fs.readdirSync(authorPath);

//       books.forEach((book) => {
//         const bookPath = path.join(authorPath, book);
//         if (fs.statSync(bookPath).isDirectory()) {
//           const files = fs.readdirSync(bookPath);
//           const epubFile = files.find(file => file.endsWith('.epub'));

//           if (epubFile) {
//             const epubFullPath = path.join(bookPath, epubFile);
//             console.log(`Found EPUB: "${epubFullPath}" for book "${book}" by "${author}"`);
//             epubPaths.push({
//               title: book,
//               author: author,
//               path: epubFullPath,
//             });
//           } else {
//             console.warn(`No EPUB file found in directory: "${bookPath}"`);
//           }
//         }
//       });
//     }
//   });

//   return epubPaths;
// }

// global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// global.fetch = fetch as any;

// // Read the first five pages of an EPUB

// async function getFirstFivePages(epubPath: string): Promise<string> {
//   try {
//     const epub = new Epub(epubPath);  // Pass only the path as argument
//     await new Promise((resolve, reject) => {
//       epub.on('end', resolve);
//       epub.on('error', reject);
//       epub.parse();
//     });

//     let pages = '';
//     const numItems = Math.min(5, epub.flow.length);

//     for (let i = 0; i < numItems; i++) {
//       const chapterId = epub.flow[i]?.id;
//       if (!chapterId) continue; // Skip if chapter ID is missing

//       const chapterContent = await new Promise<string | null>((resolve, reject) => {
//         epub.getChapter(chapterId, (err, text) => {
//           if (err) reject(err);
//           else resolve(text || null);
//         });
//       });

//       pages += chapterContent || '';
//       pages += '\n\n';
//     }

//     return pages.trim() || 'No content extracted';
//   } catch (error) {
//     console.error('Error processing EPUB:', error);
//     return 'No content extracted';
//   }
// }

// // Get category tags from Ollama
// // Get category tags from Ollama (Concise two-word tags)
// async function getOllamaCategoryTags(content: string): Promise<string[]> {
//   try {
//     const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
//       model: OLLAMA_MODEL,
//       prompt: `
//       You are a book categorizer. Your task is to analyze the given book content and provide exactly 2 concise category tags. Each tag must consist of exactly two words. No explanations or extra text. 

//       Example:
//       Content: "This book discusses the evolution of computing systems and their application in artificial intelligence. It explores machine learning models and data-driven decision-making."
//       Response: "artificial intelligence, computer science"

//       Now analyze this content:
//       "${content}"
//       `,
//       stream: false,
//       options: {
//         temperature: 0.3,
//         top_k: 10,
//         top_p: 0.9,
//       },
//     });

//     // Extract tags, trim whitespace, and ensure only two tags are returned
//     const tags = response.data.response
//       .split(',')
//       .map((tag: string) => tag.trim())
//       .filter((tag: string) => tag.split(' ').length === 2) // Ensure exactly two-word tags
//       .slice(0, 2);

//     console.log('Extracted tags:', tags);
//     return tags;

//   } catch (error: any) {
//     console.error('Error getting categories:', error.message);
//     return ['Uncategorized', 'Unknown'];
//   }
// }


// // Process books from Calibre
// router.post('/fetch-calibre', async (req, res) => {
//   try {
//     console.log('Fetching books from Calibre directory...');
//     const bookPaths = await getEpubPaths();
//     const processedBooks: ProcessedBook[] = [];

//     for (const book of bookPaths) {
//       console.log('\n-----------------------------------');
//       console.log(`Processing book: "${book.title}" by "${book.author}"`);

//       const excerpt = await getFirstFivePages(book.path);
//       console.log('Excerpt:', excerpt);

//       if (excerpt === 'No content available' || excerpt === 'No content extracted') {
//         console.warn(`No content extracted from "${book.title}"`);
//         continue;
//       }

//       try {
//         const tags = await getOllamaCategoryTags(excerpt);
//         console.log('Tags final:', tags);

//         const processedBook: ProcessedBook = {
//           id: -1,
//           title: book.title,
//           author: book.author,
//           path: book.path,
//           excerpt,
//           tags,
//           processed_at: new Date().toISOString(),
//         };

//         console.log('Successfully processed book:', {
//           title: processedBook.title,
//           author: processedBook.author,
//           path: processedBook.path,
//           tags: processedBook.tags,
//         });

//         const stmt = db.prepare(`
//           INSERT INTO books (title, author, path, excerpt, tags, processed_at)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `);

//         stmt.run(
//           processedBook.title,
//           processedBook.author,
//           processedBook.path,
//           processedBook.excerpt,
//           processedBook.tags.join(','),
//           processedBook.processed_at
//         );

//         stmt.finalize();
//         processedBooks.push(processedBook);

//       } catch (error) {
//         console.error(`Error processing book "${book.title}":`, error);
//       }
//     }

//     console.log('\n-----------------------------------');
//     console.log(`Completed processing ${processedBooks.length} books`);

//     res.json({
//       total_processed: processedBooks.length,
//       books: processedBooks.map(book => ({
//         title: book.title,
//         author: book.author,
//         path: book.path,
//         excerpt: book.excerpt,
//         tags: book.tags,
//         processed_at: book.processed_at,
//       })),
//     });

//   } catch (error: any) {
//     console.error('Error in book processing:', error);
//     res.status(500).json({
//       error: 'Failed to process books from Calibre',
//       message: error.message,
//     });
//   }
// });

// export default router;

//////////////////////////////////////////////////////////////
import express from 'express';
import db from '../db/database';
import fs from 'fs';
import path from 'path';
import { XMLHttpRequest } from 'xmlhttprequest';
import fetch from 'node-fetch';
import Epub from 'epub2'; // Install with `npm install epub2`
import axios from 'axios';
import dotenv from 'dotenv';
import { Book } from '../models/Book';

dotenv.config();

const router = express.Router();

const OLLAMA_API_URL = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'llama3.2';
const BOOKS_DIR = path.resolve('/Users/adhnan/Calibre Library');

interface ProcessedBook {
  id: number;
  title: string;
  author: string;
  path: string;
  excerpt: string;
  tags: string[];
  processed_at: string;
}

global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
global.fetch = fetch as any;

// Helper function to filter valid chapters
function isValidChapter(title: string | undefined): boolean {
  const ignoredTitles = ['preface', 'dedication', 'acknowledgment', 'table of contents', 'introduction'];
  if (!title) return true; // Allow chapters with no title
  return !ignoredTitles.some((ignored) => title.toLowerCase().includes(ignored));
}
// Helper to traverse directories and find EPUB files
// Update getEpubPaths to use the dynamic `calibreDir`
async function getEpubPaths(calibreDir: string): Promise<{ title: string; author: string; path: string }[]> {
  const epubPaths: { title: string; author: string; path: string }[] = [];
  console.log('Scanning for EPUB files in:', calibreDir);

  const authors = fs.readdirSync(calibreDir);
  console.log('Found authors:', authors);

  authors.forEach((author) => {
    const authorPath = path.join(calibreDir, author);
    if (fs.statSync(authorPath).isDirectory()) {
      const books = fs.readdirSync(authorPath);
      console.log('Found books for author', author, ':', books);

      books.forEach((book) => {
        const bookPath = path.join(authorPath, book);
        if (fs.statSync(bookPath).isDirectory()) {
          const files = fs.readdirSync(bookPath);
          const epubFile = files.find((file) => file.endsWith('.epub'));

          if (epubFile) {
            const epubFullPath = path.join(bookPath, epubFile);
            epubPaths.push({
              title: book,
              author: author,
              path: epubFullPath,
            });
            console.log('Found EPUB file:', epubFullPath);
          }
        }
      });
    }
  });

  return epubPaths;
}


// Extract content from the first two valid chapters of the EPUB
async function getRelevantBookContent(epubPath: string): Promise<string> {
  try {
    console.log('Processing EPUB:', epubPath);
    const epub = new Epub(epubPath);
    await new Promise((resolve, reject) => {
      epub.on('end', resolve);
      epub.on('error', reject);
      epub.parse();
    });

    console.log('EPUB structure:', epub.flow);

    let content = '';
    let chapterCount = 0;

    for (const chapter of epub.flow) {
      const title = chapter.title || '';
      console.log('Found chapter:', title);
      if (isValidChapter(title) && chapter.id) {
        if (chapter.id === 'pg-footer') {
          console.log('Skipping footer chapter:', title);
          continue; // Skip footer or non-content chapters
        }

        const chapterText = await new Promise<string | null>((resolve, reject) => {
          epub.getChapter(chapter.id || '', (err, text) => {
            if (err) {
              console.error('Error getting chapter:', err);
              reject(err);
            } else {
              console.log('Chapter text:', text ? text.slice(0, 100) : 'No text');
              resolve(text || null);
            }
          });
        });

        if (chapterText) {
          console.log('Extracted chapter content:', chapterText.slice(0, 500)); // Log part of the extracted text
          content += `\n### ${title} ###\n` + chapterText.slice(0, 1000) + '\n';
          chapterCount++;
        } else {
          console.log('No content found for chapter:', title);
          // Optionally, you can try to extract content from the chapter's href directly
          if (chapter.href) {
            const chapterPath = path.join(path.dirname(epubPath), chapter.href);
            if (fs.existsSync(chapterPath)) {
              const fileContent = fs.readFileSync(chapterPath, 'utf-8');
              content += `\n### ${title} ###\n` + fileContent.slice(0, 1000) + '\n';
              chapterCount++;
            }
          }
        }
      }

      if (chapterCount >= 2) break; // Limit to first two valid chapters
    }

    console.log('Extracted content:', content.trim());
    return content.trim() || 'No content extracted';
  } catch (error) {
    console.error('Error processing EPUB:', error);
    return 'No content extracted';
  }
}


// Get category tags from Ollama
async function getOllamaCategoryTags(content: string): Promise<string[]> {
  try {
    console.log('Requesting categories from Ollama API with content:', content);
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: `
      You are a book categorizer. Your task is to analyze the given book content and provide exactly 2 concise category tags. Each tag must consist of exactly two words. No explanations or extra text. 

      Example:
      Content: "This book discusses the evolution of computing systems and their application in artificial intelligence. It explores machine learning models and data-driven decision-making."
      Response: "artificial intelligence, computer science"

      Now analyze this content:
      "${content}"
      `,
      stream: false,
      options: {
        temperature: 0.3,
        top_k: 10,
        top_p: 0.9,
      },
    });

    const tags = response.data.response
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.split(' ').length === 2)
      .slice(0, 2);

    console.log('Received categories:', tags);
    return tags;
  } catch (error: any) {
    console.error('Error getting categories:', error.message);
    return ['Uncategorized', 'Unknown'];
  }
}

// Get all books

interface DBBook {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  tags: string | null;
}
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

router.get('/status', (req, res) => {
<<<<<<< HEAD
  res.json({ status: 'ok' });
});

=======
  res.send('Backend is up and running');
});


>>>>>>> new-branch-name
// Process books from Calibre
router.post('/fetch-calibre', async (req, res) => {
  const calibreDir = req.body.calibreDir || '/Users/adhnan/Calibre Library';  // Fallback to hardcoded value

  if (!fs.existsSync(calibreDir)) {
    res.status(400).json({ error: 'Invalid Calibre directory path' });
    return;
  }

  try {
    console.log('Starting to fetch and process books from Calibre...');
    const bookPaths = await getEpubPaths(calibreDir);
    console.log('Total books found:', bookPaths.length);
    
    const processedBooks: ProcessedBook[] = [];

    for (const book of bookPaths) {
      console.log('Processing book:', book.title);
      const excerpt = await getRelevantBookContent(book.path);

      if (excerpt === 'No content extracted') {
        console.log('Skipping book due to no content extracted:', book.title);
        continue;
      }

      try {
        const tags = await getOllamaCategoryTags(excerpt);
        console.log('Categories for book', book.title, ':', tags);

        const processedBook: ProcessedBook = {
          id: -1,
          title: book.title,
          author: book.author,
          path: book.path,
          excerpt,
          tags,
          processed_at: new Date().toISOString(),
        };

        const stmt = db.prepare(`
          INSERT INTO books (title, author, path, excerpt, tags, processed_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          processedBook.title,
          processedBook.author,
          processedBook.path,
          processedBook.excerpt,
          processedBook.tags.join(','),
          processedBook.processed_at
        );

        stmt.finalize();
        processedBooks.push(processedBook);
        console.log('Processed book successfully:', processedBook.title);

      } catch (error) {
        console.error(`Error processing book "${book.title}":`, error);
      }
    }

    res.json({
      total_processed: processedBooks.length,
      books: processedBooks.map((book) => ({
        title: book.title,
        author: book.author,
        path: book.path,
        excerpt: book.excerpt,
        tags: book.tags,
        processed_at: book.processed_at,
      })),
    });
    console.log('Completed processing books.');
  } catch (error: any) {
    console.error('Error in book processing:', error);
    res.status(500).json({
      error: 'Failed to process books from Calibre',
      message: error.message,
    });
  }
});

export default router;
