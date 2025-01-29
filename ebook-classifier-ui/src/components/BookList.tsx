import React, { useState } from 'react';
import { Book } from '../types/Book';
import TagCloud from './TagCloud';

interface BookListProps {
  books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(books.flatMap(book => book.tags)));

  // Filter books by selected tag
  const filteredBooks = selectedTag
    ? books.filter(book => book.tags.includes(selectedTag))
    : books;

  return (
    <div className="book-list-container">
      <TagCloud
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />
      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <p className="author">By: {book.author}</p>
            <div className="book-tags">
              {book.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;