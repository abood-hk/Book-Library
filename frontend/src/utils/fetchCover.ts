import type { Book } from '../pages/Books';

const fetchCover = (book: Book, size: 'L' | 'M' | 'S' = 'L') => {
  if (book.cover_i) {
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
  }
  return 'https://openlibrary.org/images/icons/avatar_book-sm.png';
};

export default fetchCover;
