import React, { useEffect, useState } from 'react';
import { Book } from './types/Book';
import BookList from './components/BookList';
import { fetchBooks } from './services/api';
import './App.css';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
        console.log("this is data from the api",data);
      } catch (err) {
        setError('Failed to load books');
        console.error(err);
      }
    };

    loadBooks();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <h1>Ebook Classifier</h1>
      <BookList books={books} />
    </div>
  );
};

export default App;
