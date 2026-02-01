import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { IAuthResponse } from '../utils/interfaces';
import useAuth from '../hooks/UseAuth';

const Signup = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => setError(''), 3000);

    return () => clearTimeout(t);
  }, [error]);

  const from = location?.state?.from;

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError('All fields are required');
      return;
    }

    if (username.length < 3 || username.length > 15) {
      setError('Username must be 3-15 characters');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email');
      return;
    }

    setError(null);

    setLoading(true);

    api
      .post<IAuthResponse>('/users/signup', {
        email: email.trim(),
        password,
        username,
      })
      .then((res) => {
        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
        setAuth({
          accessToken: res.data.accessToken,
          user: { role: payload.role },
        });
        if (from) navigate(from, { replace: true });
        else navigate('/', { replace: true });
      })
      .catch((err) => {
        const msg =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          'Signup error';

        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create your account</h2>
          <p>Sign up and discover your next favorite book</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={submitForm} noValidate>
          <div className="auth-field">
            <label htmlFor="username-field">
              Username <span className="required">*</span>
            </label>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              id="username-field"
              type="text"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email-field">
              Email <span className="required">*</span>
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email-field"
              type="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password-field">
              Password <span className="required">*</span>
            </label>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              id="password-field"
              type="password"
            />
            <small className="auth-hint">
              7-17 chars, must contain uppercase, lowercase, number & special
              char
            </small>
          </div>

          <button disabled={loading} type="submit" className="auth-submit ">
            {loading ? 'Sign up...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account ? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
