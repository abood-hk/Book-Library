import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Book } from './Books';
import fetchCover from '../utils/fetchCover';
import { useEffect, useState } from 'react';
import uniqueCategories from '../utils/normalizeCategories';

const BookDatails = () => {
  const { olid } = useParams<{ olid: string }>();
  const [book, setBook] = useState<Book | null>(null);
  useEffect(() => {
    api
      .get(`/books/${olid}`)
      .then((response) => {
        setBook(response.data);
      })
      .catch((err) => {
        console.log('An error prevented showing the book' + err.message);
      });
  }, [olid]);

  if (!book) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-2">
      <div className="justify-center ">
        <img className="m-auto" src={fetchCover(book as Book)} alt="" />
        <h2>{book?.title}</h2>
        <h3>{uniqueCategories(book.categories).join(',')}</h3>
        <p>{book.author_name}</p>
      </div>
      <div className="my-auto">{book.description}</div>
    </div>
  );
};

export default BookDatails;
