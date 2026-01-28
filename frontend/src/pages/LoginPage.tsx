import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import type { IAuthResponse } from '../utils/interfaces';
import useAuth from '../hooks/UseAuth';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { setAuth } = useAuth();

  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => setError(''), 3000);

    return () => clearTimeout(t);
  }, [error]);

  const navigate = useNavigate();

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email');
      return;
    }

    setError(null);

    setLoading(true);

    api
      .post<IAuthResponse>('/users/login', {
        email: email.trim(),
        password,
      })
      .then((res) => {
        setAuth({
          accessToken: res.data.accessToken,
        });
        navigate('/');
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
          <h2>Login</h2>
          <p>Login and pick up where you left off</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={submitForm} noValidate>
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
          </div>
          <button disabled={loading} type="submit" className="auth-submit ">
            {loading ? 'Login...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Do not have an account ? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
