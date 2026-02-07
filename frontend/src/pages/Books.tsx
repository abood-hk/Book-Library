import api from '../api/axiosInstance';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import uniqueCategories, { GENRES } from '../utils/normalizeCategories';
import fetchCover from '../utils/fetchCover';
import useAxiosPrivate from '../hooks/UseAxiosPrivate';
import useAuth from '../hooks/UseAuth';

export type Book = {
  olid: string;
  isbns?: [string];
  primaryEditionOlid?: string;
  cover_i?: number;
  title: string;
  author_name: string;
  description: string;
  categories: string[];
};

interface IApiGetResponse {
  books: Book[];
  totalPages: number;
}

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 30);
  const sort = searchParams.get('sort') ?? 'default';
  const search = searchParams.get('q') ?? '';
  const selectedCategories = useMemo(() => {
    const value = searchParams.get('categories');
    return value ? value.split(',') : [];
  }, [searchParams]);

  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { auth } = useAuth();

  const axiosPrivate = useAxiosPrivate();

  const location = useLocation();

  const userIdRef = useRef<string | null>(null);
  const oldSortRef = useRef<string>(sort);
  const oldLimitRef = useRef<number>(limit);
  const oldSelectedCategoriesRef = useRef(searchParams.get('categories') ?? '');
  const oldSearchRef = useRef(search);
  const searchTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateSearchParams = (
    updates: Record<string, string | number | null>,
  ) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value == '' || value == null) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

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

  const blackList = (olid: string) => {
    axiosPrivate
      .post(`/admin/books/${olid}`)
      .then(() => {
        setBooks((prev) =>
          prev.filter((book) => {
            return book.olid !== olid;
          }),
        );
      })
      .catch(() => {
        console.error('Error prevented blacklisting');
      });
  };

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

  useEffect(() => {
    if (limit !== oldLimitRef.current) {
      const oldOffset = (page - 1) * oldLimitRef.current;
      const newPage = Math.floor(oldOffset / limit) + 1;
      updateSearchParams({ page: newPage });
      oldLimitRef.current = limit;
    }
    if (sort !== oldSortRef.current) {
      updateSearchParams({ page: 1 });
      oldSortRef.current = sort;
    }
    const categoriesString = searchParams.get('categories') ?? '';

    if (oldSelectedCategoriesRef.current !== categoriesString) {
      updateSearchParams({ page: 1 });
      oldSelectedCategoriesRef.current = categoriesString;
    }
    if (oldSearchRef.current !== search) {
      updateSearchParams({ page: 1 });
      oldSearchRef.current = search;
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      setLoading(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      api
        .get<IApiGetResponse>('/books', {
          params: {
            page,
            limit,
            categories: selectedCategories.join(','),
            q: search,
            sort,
          },
          signal: abortControllerRef.current?.signal,
        })
        .then((response) => {
          setBooks(response.data.books);
          setTotalPages(response.data.totalPages);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'CanceledError') return;
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ error?: string }>;
            if (axiosError.response?.data?.error) {
              setError(`Error: ${axiosError.response.data.error}`);
            } else if (axiosError.response) {
              setError(
                `Request failed with status ${axiosError.response.status}`,
              );
            } else {
              setError(`Network error: ${axiosError.message}`);
            }
          } else if (error instanceof Error) {
            setError(`Unexpected error: ${error.message}`);
          } else {
            setError('An unknown error occurred');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [page, limit, sort, selectedCategories, search]);

  useEffect(() => {
    if (auth.accessToken) {
      const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));
      const currentId = payload._id;

      if (userIdRef.current === currentId) {
        return;
      }

      userIdRef.current = currentId;
    }
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

  const sortedCategories = [...GENRES]
    .filter((cat) => cat !== 'Other')
    .sort((a, b) => a.localeCompare(b));

  if (error) return <p>{error}</p>;

  return (
    <>
      {toastMessage && (
        <div className="toast toast-error">
          <span>{toastMessage}</span>
          <span className="link">
            <Link state={{ from: location }} to="/login">
              Login
            </Link>
          </span>
        </div>
      )}

      <div className="books-toolbar">
        <div className="toolbar-item left">
          <label htmlFor="select-sort">Sort By</label>
          <select
            id="select-sort"
            value={sort}
            onChange={(e) =>
              updateSearchParams({ sort: e.target.value || 'default' })
            }
          >
            <option value="default">First Created</option>
            <option value="mostReviewed">Most Reviewed</option>
            <option value="mostFavourited">Most Favourited</option>
          </select>
        </div>

        <div className="toolbar-item center">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search by author or title..."
            value={search}
            onChange={(e) => updateSearchParams({ q: e.target.value })}
          />
        </div>

        <div className="toolbar-item right">
          <label htmlFor="select-limit">Books Per Page</label>
          <select
            id="select-limit"
            value={limit}
            onChange={(e) =>
              updateSearchParams({ limit: parseInt(e.target.value || '30') })
            }
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <div className="categories-wrapper mb-6">
        <div
          className="categories-header cursor-pointer flex items-center justify-center gap-2 select-none"
          onClick={() => setCategoriesExpanded((prev) => !prev)}
        >
          <span>Filter By Category</span>
          <span
            className={`transition-transform duration-300 ${categoriesExpanded ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </div>

        {selectedCategories.length > 0 && (
          <div className="selected-categories flex flex-wrap gap-2 mt-2 justify-center">
            {selectedCategories.map((cat) => (
              <label key={cat} className="category-chip active">
                <input
                  type="checkbox"
                  checked
                  onChange={() => {
                    const next = selectedCategories.filter((c) => c !== cat);
                    updateSearchParams({
                      categories: next.length ? next.join(',') : null,
                      page: 1,
                    });
                  }}
                />
                {cat}
              </label>
            ))}
          </div>
        )}

        <div
          className={`categories-list grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
            categoriesExpanded
              ? 'max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          {sortedCategories.map((cat) => {
            if (selectedCategories.includes(cat)) return null; // already shown above
            return (
              <label key={cat} className="category-chip">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedCategories, cat]
                      : selectedCategories.filter((c) => c !== cat);
                    updateSearchParams({ categories: next.join(','), page: 1 });
                  }}
                />
                {cat}
              </label>
            );
          })}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <button
          className="clear-categories cursor-pointer mb-5"
          onClick={(e) => {
            e.preventDefault();
            updateSearchParams({ categories: null, page: 1 });
          }}
        >
          Clear all
        </button>
      )}

      {loading && <h2>Loading...</h2>}
      {!loading && books.length === 0 && (
        <p className="text-center">
          Oops! We couldn't find any books matching your search or selected
          categories. Try different keywords or filters.
        </p>
      )}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-7">
            {books.map((book) => (
              <Link
                key={book.olid}
                state={{ from: location }}
                to={`/books/${book.olid}`}
                className="h-full"
              >
                <div className="book-card pt-2">
                  <div className="book-image-section pb-2">
                    <img
                      src={fetchCover(book)}
                      alt={book.title}
                      className="book-image"
                    />

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
                      className="book-heart"
                    >
                      <svg viewBox="0 0 24 24" className="heart-icon">
                        <path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                   C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          className={liked.includes(book.olid) ? 'active' : ''}
                        />
                      </svg>
                    </div>

                    {(auth.user?.role === 'admin' ||
                      auth.user?.role === 'super admin') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          blackList(book.olid);
                        }}
                        className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold
                         text-white bg-gray-800/80 rounded-full"
                      >
                        Blacklist
                      </button>
                    )}
                  </div>

                  <div className="book-info-section">
                    <h2 className="book-title">{book.title}</h2>
                    <p className="book-author">{book.author_name}</p>
                    <h3 className="book-categories">
                      {uniqueCategories(book.categories).join(', ')}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="mt-10">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (num, _, nums) => {
            if (num - page > 2 || num - page < -2) return null;

            const paginationButtonSty = `
              px-3 py-1 mx-0.5 my-0.5 cursor-pointer transition-colors rounded-sm  `;

            const activePaginationButtonSty = () => {
              return paginationButtonSty;
            };

            const numButton = (
              <button
                key={num}
                onClick={() => updateSearchParams({ page: num })}
                className={`${paginationButtonSty} ${num === page ? 'active-page' : ''}`}
              >
                {num}
              </button>
            );

            const nextButton = (
              <button
                key="next"
                onClick={() => updateSearchParams({ page: page + 1 })}
                className={activePaginationButtonSty()}
                aria-label="Next page"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );

            const prevButton = (
              <button
                key="prev"
                onClick={() => updateSearchParams({ page: page - 1 })}
                className={activePaginationButtonSty()}
                aria-label="Previous page"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            );

            const firstButton = (
              <button
                key="first"
                onClick={() => updateSearchParams({ page: 1 })}
                className={activePaginationButtonSty()}
                aria-label="First page"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 19l-7-7 7-7" />
                  <path d="M20 19l-7-7 7-7" />
                </svg>
              </button>
            );

            const lastButton = (
              <button
                key="last"
                onClick={() => updateSearchParams({ page: nums.length })}
                className={activePaginationButtonSty()}
                aria-label="Last page"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 5l7 7-7 7" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </button>
            );

            if (page - num == 2)
              return (
                <>
                  {firstButton} {prevButton}
                  {numButton}
                </>
              );
            if (num - page === 2)
              return (
                <>
                  {numButton}
                  {nextButton}
                  {lastButton}
                </>
              );
            return numButton;
          },
        )}
      </div>
      {showScrollTop && (
        <button
          className="scroll-top fixed bottom-6 right-6 z-50 p-3 rounded-full
             bg-primary shadow-lg
             animate-[float-up_1.6s_ease-in-out_infinite]
             hover:scale-110 transition-transform"
          aria-label="Scroll to top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white"
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
  );
};

export default Books;
