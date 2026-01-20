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

  const oldSortRef = useRef<string>(sort);
  const oldLimitRef = useRef<number>(limit);
  const oldSelectedCategoriesRef = useRef(selectedCategories);
  const oldSearchRef = useRef(search);
  const searchTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  if (error) return <p>{error}</p>;

  return (
    <>
      <label htmlFor="select-sort">Sort by</label>
      <select
        id="select-sort"
        value={sort}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setSort(e.target.value || 'default');
        }}
        className="ml-2  my-10  bg-black"
      >
        <option value="dafault">First Created</option>
        <option value="mostReviewed">Most Reviewed</option>
        <option value="mostFavourited">Most Favourited</option>
      </select>
      <input
        type="text"
        className="bg-gray-800 w-2xl p-1.5 rounded-xl"
        placeholder="Search by author name or book label"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
        }}
      />
      <label htmlFor="select-limit"> Books per page: </label>
      <select
        id="select-limit"
        value={limit}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setLimit(parseInt(e.target.value || '30'));
        }}
        className="my-10 bg-black "
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={30}>30</option>
        <option value={50}>50</option>
      </select>
      <h3 key={'change-cate-label'}>Filter by categories</h3>
      <div className="grid grid-cols-3" key={'categories-container'}>
        {GENRES.map((cat) => {
          if (cat === 'Other') return;
          return (
            <div key={cat}>
              <label className="flex items-center gap-2">
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
            </div>
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
                  <img className="w-40 m-auto" src={fetchCover(book)} alt="" />
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

            const activePaginationButtonSty = (active: boolean) => {
              return `${paginationButtonSty}  ${
                active
                  ? ' text-white bg-gray-600 hover:bg-gray-700'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`;
            };

            const numButton = (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={activePaginationButtonSty(num === page)}
              >
                {num}
              </button>
            );

            const nextButton = (
              <button
                key="next"
                onClick={() => setPage(page + 1)}
                className={activePaginationButtonSty(false)}
              >
                {'->'}
              </button>
            );

            const prevButton = (
              <button
                key="prev"
                onClick={() => setPage(page - 1)}
                className={activePaginationButtonSty(false)}
              >
                {'<-'}
              </button>
            );

            const firstButton = (
              <button
                key="first"
                onClick={() => setPage(1)}
                className={activePaginationButtonSty(false)}
              >
                {'<<-'}
              </button>
            );

            const lastButton = (
              <button
                key="last"
                onClick={() => setPage(nums.length)}
                className={activePaginationButtonSty(false)}
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
