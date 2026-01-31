import { useLocation, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAxiosPrivate from '../hooks/UseAxiosPrivate';
import type { Book } from './Books';
import fetchCover from '../utils/fetchCover';
import { useEffect, useRef, useState } from 'react';
import uniqueCategories from '../utils/normalizeCategories';
import useAuth from '../hooks/UseAuth';
import { Link, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { olid } = useParams<{ olid: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [liked, setLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set(''));

  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const userIdRef = useRef<string | null>(null);

  const from = location?.state?.from;

  const addToLiked = async (olid: string) => {
    if (liked) return;

    setPending((prev) => new Set(prev).add(olid));

    setLiked(true);
    try {
      await axiosPrivate.post(`/users/favourites/${olid}`);
    } catch (err) {
      setLiked(false);
      setToastMessage('You need to login to add to favourites');
      console.error(err);
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(olid);
        return next;
      });
    }
  };

  const removeFromLiked = async (olid: string) => {
    if (!liked) return;

    setPending((prev) => new Set(prev).add(olid));

    setLiked(false);
    try {
      await axiosPrivate.delete(`/users/favourites/${olid}`);
    } catch (err) {
      setLiked(true);
      setToastMessage('You need to login to remove from favourites');
      console.error(err);
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(olid);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!toastMessage) return;

    const t = setTimeout(() => setToastMessage(''), 3000);

    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    api.get(`/books/${olid}`).then((res) => setBook(res.data));
  }, [olid]);

  useEffect(() => {
    if (!auth.accessToken) {
      setLiked(false);
      return;
    }
    const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));
    const currentId = payload._id;

    if (userIdRef.current === currentId) {
      return;
    }

    userIdRef.current = currentId;

    axiosPrivate
      .get<string[]>('/users/favouritesIds')
      .then((res) => {
        if (!olid) {
          setLiked(false);
        }
        setLiked(res.data.includes(olid as string));
      })
      .catch(() => {
        setLiked(false);
      });
  }, [auth.accessToken]);

  if (!book) return <p>Loading...</p>;

  return (
    <>
      {toastMessage && (
        <div className="toast toast-error">
          <span>{toastMessage}</span>
          <span className="link">
            <Link to="/login" state={{ from: location }}>
              Login
            </Link>
          </span>
        </div>
      )}
      <div className="book-details-header">
        <button
          className="back-button cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            if (from) {
              navigate(from);
            } else {
              navigate('/books');
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="back-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to books</span>
        </button>
      </div>

      <div className="book-details-clean">
        <div className="book-left">
          <div className="relative">
            <img
              className="book-cover-clean"
              src={fetchCover(book)}
              alt={book.title}
            />

            <div
              onClick={(e) => {
                e.preventDefault();
                if (pending.has(book.olid)) return;

                if (!liked) {
                  addToLiked(book.olid);
                } else {
                  removeFromLiked(book.olid);
                }
              }}
              className="book-heart"
            >
              <svg
                viewBox="0 0 24 24"
                className={`heart-icon ${liked ? 'active' : ''}`}
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
            C13.09 3.81 14.76 3 16.5 3
            19.58 3 22 5.42 22 8.5
            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>
          </div>

          <h2>{book.title}</h2>
          <p className="book-author">{book.author_name}</p>
          <p className="book-categories">
            <span className={!book.description ? 'opacity-80 italic' : ''}>
              {uniqueCategories(book.categories).join(', ') ||
                'No Available Categories.'}
            </span>
          </p>
        </div>

        <div className="book-right">
          <p className={!book.description ? 'opacity-80 italic' : ''}>
            {book.description || 'No Description Available.'}
          </p>
        </div>
        <div>Review</div>
      </div>
    </>
  );
};

export default BookDetails;
