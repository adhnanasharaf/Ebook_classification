// import sqlite3 from 'sqlite3';
// import { Database } from 'sqlite3';

// const db: Database = new sqlite3.Database('books.db');

// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS books (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       author TEXT NOT NULL,
//       excerpt TEXT NOT NULL,
//       tags TEXT
//     )
//   `);
// });

// export default db; 


import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../books.db');
const db = new sqlite3.Database(dbPath);

console.log('Database path:', dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      tags TEXT,
      processed_at TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Books table created or already exists');
    }
  });
});

export default db;