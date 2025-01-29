import { Book } from '../types/Book';

// Sample data for initial testing
// const sampleBooks: Book[] = [
//   {
//     id: '1',
//     title: 'The Myth of Sisyphus',
//     author: 'Albert Camus',
//     excerpt: 'There is but one truly serious philosophical question, and that is suicide...',
//     tags: ['Philosophy', 'Existentialism', 'Essays'],
//     processed: true
//   },
//   {
//     id: '2',
//     title: 'Being and Nothingness',
//     author: 'Jean-Paul Sartre',
//     excerpt: 'Being and Nothingness is a philosophical treatise that explores...',
//     tags: ['Philosophy', 'Existentialism', 'Phenomenology'],
//     processed: true
//   },
//   // Add more sample books as needed
// ];



const API_URL = 'http://localhost:5000'; // Backend server URL

export const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_URL}/books`);  // Note: not '/api/books' but '/books'
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
};