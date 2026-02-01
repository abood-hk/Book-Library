import { useEffect, useRef, useState } from 'react';
import useAxiosPrivate from '../hooks/UseAxiosPrivate';
import useAuth from '../hooks/UseAuth';
import type { Book } from '../pages/Books';
import { Link, useLocation } from 'react-router-dom';
import fetchCover from '../utils/fetchCover';
import uniqueCategories from '../utils/normalizeCategories';

type ShowProps = {
  page: string;
};

const Show = ({ page }: ShowProps) => {
  const axiosPrivate = useAxiosPrivate();
  const [books, setBooks] = useState<Book[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { auth } = useAuth();
  const location = useLocation();

  const userIdRef = useRef<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToLiked = async (olid: string) => {
    if (liked.includes(olid)) return;

    setPending((prev) => new Set(prev).add(olid));

    setLiked((prev) => [...prev, olid]);
    try {
      await axiosPrivate.post(`/users/favourites/${olid}`);
    } catch (err) {
      setLiked((prev) =>
        prev.filter((books) => {
          return books != olid;
        }),
      );
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
    if (!liked.includes(olid)) return;

    setPending((prev) => new Set(prev).add(olid));

    setLiked((prev) =>
      prev.filter((books) => {
        return books != olid;
      }),
    );
    try {
      await axiosPrivate.delete(`/users/favourites/${olid}`);
      setBooks((prev) =>
        prev.filter((books) => {
          return books.olid != olid;
        }),
      );
    } catch (err) {
      setLiked((prev) => [...prev, olid]);
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
    if (auth.accessToken) {
      const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));

      const currentId = payload?._id;

      if (userIdRef.current === currentId) {
        return;
      }

      userIdRef.current = currentId;
      setBooks([]);
      setLiked([]);
      setLoading(true);
    }
    setLoading(true);

    axiosPrivate
      .get<Book[]>(`/users/${page}`)
      .then((res) => {
        setBooks(res.data);
      })
      .catch(() => {
        setBooks([]);
      })
      .finally(() => {
        setLoading(false);
      });

    axiosPrivate
      .get<string[]>('/users/favouritesIds')
      .then((res) => {
        setLiked(res.data);
      })
      .catch(() => {
        setLiked([]);
      });
  }, [auth.accessToken]);

  useEffect(() => {
    if (!toastMessage) return;

    const t = setTimeout(() => setToastMessage(''), 3000);

    return () => clearTimeout(t);
  }, [toastMessage]);

  const message =
    page === 'favourites'
      ? 'Add Books To Your Favourites To See Them Here'
      : page === 'myreviews'
        ? 'Review Books To See Them Here'
        : page === 'blacklist'
          ? 'Add Books To Blacklist To See Them Here'
          : 'No data to display';

  const loginMessage =
    page === 'favourites'
      ? 'Login So You Can Add Books To Your Favourites'
      : page === 'myreviews'
        ? 'Login So You Can Review Books'
        : page === 'blacklist'
          ? 'You Are Not Authorized To Access This Page'
          : 'Not Authorized';

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
        {!auth.accessToken && !loading && <h2>{loginMessage}</h2>}
        {books.length === 0 && !loading && auth.accessToken && (
          <h2>{message}</h2>
        )}
        <div className="grid grid-cols-3 gap-7 ">
          {books.map((book) => (
            <Link key={book.olid} to={`/books/${book.olid}`}>
              <div className=" ">
                <div className="relative">
                  <img className="w-40 m-auto" src={fetchCover(book)} alt="" />

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      if (pending.has(book.olid)) return;
                      if (liked.includes(book.olid)) {
                        removeFromLiked(book.olid);
                      } else if (!liked.includes(book.olid)) {
                        addToLiked(book.olid);
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-6 h-6 transition-transform duration-200 ${
                        liked.includes(book.olid) ? 'scale-125' : ''
                      }`}
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
           4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
           14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
           6.86-8.55 11.54L12 21.35z"
                        fill={
                          liked.includes(book.olid)
                            ? 'rgb(var(--primary))'
                            : 'none'
                        }
                        stroke="rgb(var(--primary))"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
                <h2>{book.title}</h2>
                <p>{book.author_name}</p>
                <h3>{uniqueCategories(book.categories).join(', ')}</h3>
              </div>
            </Link>
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

export default Show;
