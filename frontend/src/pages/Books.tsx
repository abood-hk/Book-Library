import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import uniqueCategories, { GENRES } from '../utils/normalizeCategories';
import fetchCover from '../utils/fetchCover';

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
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(30);
  const [sort, setSort] = useState<string>('default');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const oldSortRef = useRef<string>(sort);
  const oldLimitRef = useRef<number>(limit);
  const oldSelectedCategoriesRef = useRef(selectedCategories);
  const oldSearchRef = useRef(search);
  const searchTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addToLiked = (olid: string) => {
    if (liked.includes(olid)) return;

    setLiked((prev) => [...prev, olid]);

    api.post(`/users/favourites/${olid}`).catch((err) => {
      setLiked((prev) =>
        prev.filter((books) => {
          return books != olid;
        }),
      );
      setToastMessage('You need to sign in to add to favourites');
      console.error(err);
    });
  };

  const removeFromLiked = (olid: string) => {
    if (!liked.includes(olid)) return;

    setLiked((prev) =>
      prev.filter((books) => {
        return books != olid;
      }),
    );
    api.delete(`/users/favourites/${olid}`, {}).catch((err) => {
      setLiked((prev) => [...prev, olid]);
      setToastMessage('You need to sign in to remove from favourites');
      console.error(err);
    });
  };

  useEffect(() => {
    if (limit !== oldLimitRef.current) {
      const oldOffset = (page - 1) * oldLimitRef.current;
      const newPage = Math.floor(oldOffset / limit) + 1;
      setPage(newPage);
      oldLimitRef.current = limit;
    }
    if (sort !== oldSortRef.current) {
      setPage(1);
      oldSortRef.current = sort;
    }
    if (oldSelectedCategoriesRef.current !== selectedCategories) {
      setPage(1);
      oldSelectedCategoriesRef.current = selectedCategories;
    }
    if (oldSearchRef.current !== search) {
      setPage(1);
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
    const getFavourites = () => {
      api
        .get<string[]>('/users/favouritesIds', {})
        .then((res) => {
          setLiked(res.data);
        })
        .catch(() => {
          setLiked([]);
        });
    };
    getFavourites();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const t = setTimeout(() => setToastMessage(''), 3000);

    return () => clearTimeout(t);
  }, [toastMessage]);

  if (error) return <p>{error}</p>;

  return (
    <>
      {toastMessage && (
        <div className="toast toast-error">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')}>Dismiss</button>
        </div>
      )}
      <div className="books-toolbar">
        <div className="toolbar-item left">
          <label htmlFor="select-sort">Sort By</label>
          <select
            id="select-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value || 'default')}
          >
            <option value="default">First Created</option>
            <option value="mostReviewed">Most Reviewed</option>
            <option value="mostFavourited">Most Favourited</option>
          </select>
        </div>

        <div className="toolbar-item center">
          <input
            type="text"
            placeholder="Search by author or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-item right">
          <label htmlFor="select-limit">Books Per Page</label>
          <select
            id="select-limit"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value || '30'))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <h3 className="categories-title">Filter By Category</h3>
      <div className="categories-container">
        {GENRES.map((cat) => {
          if (cat === 'Other') return;
          return (
            <label
              key={cat}
              className={`category-chip ${
                selectedCategories.includes(cat) ? 'active' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  setSelectedCategories((prev) =>
                    e.target.checked
                      ? prev.includes(cat)
                        ? prev
                        : [...prev, cat]
                      : prev.filter((e) => e !== cat),
                  );
                }}
              />
              {cat}
            </label>
          );
        })}
      </div>
      {loading && <h2>Loading...</h2>}
      {!loading && (
        <>
          {books.length === 0 && <h2>No book found</h2>}
          <div className="grid grid-cols-3 gap-7 ">
            {books.map((book) => (
              <Link key={book.olid} to={`/books/${book.olid}`}>
                <div className=" ">
                  <div className="relative">
                    <img
                      className="w-40 m-auto"
                      src={fetchCover(book)}
                      alt=""
                    />

                    <div
                      onClick={(e) => {
                        e.preventDefault();
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
        </>
      )}
      <div className="mt-10">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (num, i, nums) => {
            if (num - page > 2 || num - page < -2) return null;

            const paginationButtonSty = `
              px-3 py-1 mx-0.5 my-0.5 cursor-pointer transition-colors rounded-sm  `;

            const activePaginationButtonSty = () => {
              return paginationButtonSty;
            };

            const numButton = (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`${paginationButtonSty} ${num === page ? 'active-page' : ''}`}
              >
                {num}
              </button>
            );

            const nextButton = (
              <button
                key="next"
                onClick={() => setPage(page + 1)}
                className={activePaginationButtonSty()}
              >
                {'->'}
              </button>
            );

            const prevButton = (
              <button
                key="prev"
                onClick={() => setPage(page - 1)}
                className={activePaginationButtonSty()}
              >
                {'<-'}
              </button>
            );

            const firstButton = (
              <button
                key="first"
                onClick={() => setPage(1)}
                className={activePaginationButtonSty()}
              >
                {'<<-'}
              </button>
            );

            const lastButton = (
              <button
                key="last"
                onClick={() => setPage(nums.length)}
                className={activePaginationButtonSty()}
              >
                {'->>'}
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
    </>
  );
};

export default Books;
