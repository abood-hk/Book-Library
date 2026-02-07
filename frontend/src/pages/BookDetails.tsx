import { useLocation, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAxiosPrivate from '../hooks/UseAxiosPrivate';
import type { Book } from './Books';
import fetchCover from '../utils/fetchCover';
import { useEffect, useMemo, useRef, useState } from 'react';
import uniqueCategories from '../utils/normalizeCategories';
import useAuth from '../hooks/UseAuth';
import { Link, useNavigate } from 'react-router-dom';

type User = {
  username: string;
  _id: string;
  role: 'user' | 'admin' | 'super admin';
};

type Review = {
  _id: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

interface IApiRoleResponse {
  user: User;
}

interface IApiReviewResponse {
  review: Review;
}

interface IApiReviewsResponse {
  reviews: Review[];
}

const BookDetails = () => {
  const { olid } = useParams<{ olid: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [liked, setLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [roleLoadingUserId, setRoleLoadingUserId] = useState<string | null>(
    null,
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const userIdRef = useRef<string | null>(null);
  const contentRef = useRef<string | null>(null);
  const ratingRef = useRef<number | null>(null);

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

  const userId = useMemo(() => {
    try {
      if (!auth.accessToken) return null;
      return JSON.parse(atob(auth.accessToken.split('.')[1]))._id;
    } catch {
      return null;
    }
  }, [auth.accessToken]);

  const myReview = (review: Review): boolean => {
    if (!userId) return false;
    return userId === review.user._id;
  };

  const changeRole = (user: User) => {
    setRoleLoadingUserId(user._id);
    let action;
    if (user.role === 'admin') {
      action = 'demote';
    } else if (user.role === 'user') {
      action = 'promote';
    }
    axiosPrivate
      .put<IApiRoleResponse>(`/admin/users/${action}/${user._id}`)
      .then((res) => {
        setReviews((prev) =>
          prev.map((review) =>
            review.user._id === user._id
              ? {
                  ...review,
                  user: {
                    ...review.user,
                    role: res.data.user.role,
                  },
                }
              : review,
          ),
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setRoleLoadingUserId(null);
      });
  };

  const submitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const existingReview = reviews.find((review) => review.user._id === userId);

    if (existingReview) {
      setError(
        'You have already reviewed this book. You can edit or delete your existing review.',
      );
      return;
    }

    const validateError = validateReview();
    if (validateError) {
      setError(validateError);
      return;
    }

    setError(null);
    setLoading(true);
    axiosPrivate
      .post<IApiReviewResponse>(`/users/reviews/${olid}`, {
        content: content || '',
        rating,
      })
      .then((res) => {
        setReviews((prev) => [...prev, res.data.review]);
        setContent('');
        setRating(0);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          'Something went wrong while submitting your review. Please try again.';

        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validateError = validateReview();
    if (validateError) {
      setError(validateError);
      return;
    }

    if (ratingRef.current === rating && contentRef.current === content) {
      setContent('');
      setRating(0);
      ratingRef.current = null;
      contentRef.current = null;
      setEditing(false);
      return;
    }

    setError(null);
    setLoading(true);
    axiosPrivate
      .put<IApiReviewResponse>(`/users/reviews/${olid}`, {
        content: content || '',
        rating,
      })
      .then((res) => {
        setReviews((prev) =>
          prev.map((review) => {
            if (review.user._id === res.data.review.user._id) {
              return res.data.review;
            }
            return review;
          }),
        );
        setContent('');
        setRating(0);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          'Something went wrong while updating your review. Please try again.';

        setError(msg);
      })
      .finally(() => {
        setLoading(false);
        setEditing(false);
      });
  };

  const deleteReview = () => {
    setLoadingDelete(true);
    axiosPrivate
      .delete<IApiReviewResponse>(`/users/reviews/${olid}`)
      .then((res) => {
        setReviews((prev) =>
          prev.filter((review) => {
            return review.user._id !== res.data.review.user._id;
          }),
        );
      })
      .catch((err) => {
        const msg =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          'Failed to delete your review. Please try again.';

        setError(msg);
      })
      .finally(() => {
        setLoadingDelete(false);
        setConfirmDeleteId(null);
      });
  };

  const adminDeleteReview = (reviewId: string) => {
    setLoadingDelete(true);

    axiosPrivate
      .delete<IApiReviewResponse>(`/admin/reviews/${reviewId}`)
      .then((res) => {
        setReviews((prev) =>
          prev.filter((review) => {
            return review._id !== res.data.review._id;
          }),
        );
      })
      .catch((err) => {
        const msg =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          'Failed to delete the review. Please try again.';

        setError(msg);
      })
      .finally(() => {
        setLoadingDelete(false);
        setConfirmDeleteId(null);
      });
  };

  const startEditing = (review: Review) => {
    setContent(review.content);
    setRating(review.rating);

    contentRef.current = review.content;
    ratingRef.current = review.rating;

    setEditing(true);
  };

  const cancelEditing = () => {
    setContent('');
    setRating(0);
    contentRef.current = null;
    ratingRef.current = null;
    setEditing(false);
  };

  const validateReview = (): string | null => {
    if (!auth.user) {
      return 'Login so you can publish a review.';
    }

    if (rating === null || rating === undefined) {
      return 'Please select a rating before submitting your review.';
    }

    if (typeof rating !== 'number' || Number.isNaN(rating)) {
      return 'Invalid rating value. Please choose a rating from 1 to 5.';
    }

    if (!Number.isInteger(rating)) {
      return 'Rating must be a whole number between 1 and 5.';
    }

    if (rating < 1 || rating > 5) {
      return 'Please choose a rating between 1 and 5 stars.';
    }

    if (content) {
      if (typeof content !== 'string') {
        return 'Invalid comment format. Please try again.';
      }

      if (content.trim().length < 1 || content.length > 700) {
        return 'Your review is too long. Please keep it under 700 characters.';
      }
    }

    return null;
  };
  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(t);
  }, [error]);
  useEffect(() => {
    if (!toastMessage) return;

    const t = setTimeout(() => setToastMessage(''), 3000);

    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    api
      .get(`/books/${olid}`)
      .then((res) => setBook(res.data))
      .catch((err) => {
        console.error('Error fetching book:', err);
      });
  }, [olid]);

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
        if (!olid) {
          setLiked(false);
        }
        setLiked(res.data.includes(olid as string));
      })
      .catch(() => {
        setLiked(false);
      });
  }, [auth.accessToken, olid]);

  useEffect(() => {
    api
      .get<IApiReviewsResponse>(`/users/reviews/${olid}`)
      .then((res) => {
        setReviews(res.data.reviews);
      })
      .catch((err) => {
        console.error('Error occurred while fetching reviews : ', err);
      });
  }, [olid]);

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
            {book.description || 'No Available Description.'}
          </p>
        </div>
        <div className="reviews-section lg:col-span-2">
          <div className="reviews-inner">
            <h3 className="reviews-title">Reviews</h3>

            {error && <p className="review-error">{error}</p>}

            <form
              className="review-form"
              onSubmit={editing ? updateReview : submitReview}
              noValidate
            >
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                placeholder="Write your thoughts about this book..."
              />

              <div className="review-form-footer">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={0}>Rating</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <div className="review-actions">
                  <button disabled={loading} type="submit">
                    {loading
                      ? editing
                        ? 'Updating...'
                        : 'Posting...'
                      : editing
                        ? 'Update Review'
                        : 'Post Review'}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={cancelEditing}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    {auth.user?.role === 'super admin' &&
                      review.user.role !== 'super admin' && (
                        <button
                          className={`role-btn ${
                            review.user.role === 'admin' ? 'demote' : 'promote'
                          }`}
                          disabled={roleLoadingUserId === review.user._id}
                          onClick={() => changeRole(review.user)}
                        >
                          {roleLoadingUserId !== review.user._id &&
                            review.user.role === 'admin' &&
                            'Demote'}
                          {roleLoadingUserId === review.user._id &&
                            review.user.role === 'admin' &&
                            'Demoting...'}
                          {roleLoadingUserId !== review.user._id &&
                            review.user.role === 'user' &&
                            'Promote'}
                          {roleLoadingUserId === review.user._id &&
                            review.user.role === 'user' &&
                            'Promoting...'}
                        </button>
                      )}
                    <div className="review-header">
                      <div>
                        <p className="review-user">{review.user.username}</p>
                        <p className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </p>
                      </div>

                      {(myReview(review) ||
                        auth.user?.role === 'admin' ||
                        auth.user?.role === 'super admin') && (
                        <div className="review-controls">
                          {myReview(review) && (
                            <button onClick={() => startEditing(review)}>
                              {editing ? 'Editing...' : 'Edit'}
                            </button>
                          )}

                          <button
                            className="danger"
                            onClick={() => {
                              setConfirmDeleteId(review._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {confirmDeleteId === review._id && (
                      <div className="review-confirm">
                        <p>
                          {myReview(review)
                            ? 'Delete your review?'
                            : 'Delete this review?'}
                        </p>
                        <div>
                          <button
                            disabled={loadingDelete}
                            onClick={() => {
                              const isAdmin =
                                auth.user?.role === 'admin' ||
                                auth.user?.role === 'super admin';
                              if (isAdmin) {
                                adminDeleteReview(review._id);
                              } else {
                                deleteReview();
                              }
                            }}
                            className="danger"
                          >
                            {loadingDelete ? 'Deleting...' : 'Yes'}
                          </button>
                          <button
                            disabled={loadingDelete}
                            onClick={() => {
                              setConfirmDeleteId(null);
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                    {review.content && (
                      <p className="review-content">{review.content}</p>
                    )}

                    {review.createdAt !== review.updatedAt && (
                      <p className="review-edited">Edited</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetails;
