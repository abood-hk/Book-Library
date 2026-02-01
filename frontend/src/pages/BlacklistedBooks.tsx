import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/UseAxiosPrivate';
import useAuth from '../hooks/UseAuth';
import type { Book } from '../pages/Books';
import { Link, useLocation } from 'react-router-dom';
import fetchCover from '../utils/fetchCover';
import uniqueCategories from '../utils/normalizeCategories';

const BlacklistedBooks = () => {
  const axiosPrivate = useAxiosPrivate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { auth } = useAuth();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const removeFromBlackList = (olid: string) => {
    axiosPrivate
      .delete(`/admin/blacklist/${olid}`)
      .then(() => {
        setBooks((prev) =>
          prev.filter((book) => {
            return book.olid !== olid;
          }),
        );
      })
      .catch(() => {
        setToastMessage('Login As an Admin To Remove From Blacklist');
        console.error('Error Prevented Removing From Blacklist');
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);

    axiosPrivate
      .get<Book[]>('/admin/blacklist')
      .then((res) => {
        setBooks(res.data);
      })
      .catch(() => {
        setBooks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const t = setTimeout(() => setToastMessage(''), 3000);

    return () => clearTimeout(t);
  }, [toastMessage]);

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
      <>
        {loading && <h2>Loading...</h2>}
        {!auth.accessToken && !loading && (
          <h2>You Are Not Authorized To Access This Page</h2>
        )}
        {auth.user?.role === 'user' && !loading && (
          <h2>You Are Not Authorized To Access This Page</h2>
        )}
        {auth.user?.role !== 'user' &&
          books.length === 0 &&
          !loading &&
          auth.accessToken && <h2>Add Books To Blacklist To See Them Here</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {books.map((book) => (
            <div
              key={book.olid}
              className="relative bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-4 shadow-md hover:-translate-y-1 transition-transform"
            >
              <img
                className="w-40 m-auto mb-3 rounded-lg"
                src={fetchCover(book)}
                alt={book.title}
              />

              {(auth.user?.role === 'admin' ||
                auth.user?.role === 'super admin') && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromBlackList(book.olid);
                  }}
                  className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold text-white bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-700/80 transition-colors"
                >
                  Remove
                </button>
              )}

              <h2 className="font-semibold">{book.title}</h2>
              <p className="text-sm text-muted">{book.author_name}</p>
              <h3 className="text-xs text-muted">
                {uniqueCategories(book.categories).join(', ')}
              </h3>
            </div>
          ))}
        </div>
        {showScrollTop && (
          <button
            className="scroll-top cursor-pointer fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary shadow-lg hover:scale-110 transition-transform"
            aria-label="Scroll to top"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        )}
      </>
    </>
  );
};

export default BlacklistedBooks;
