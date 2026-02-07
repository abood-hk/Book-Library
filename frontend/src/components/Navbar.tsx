import { NavLink } from 'react-router-dom';
import SignoutButton from './SignoutButton';
import useAuth from '../hooks/UseAuth';
import { useState } from 'react';

const Navbar = () => {
  const { auth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition
     ${
       isActive
         ? 'bg-indigo-600 text-white'
         : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-muted))]'
     }`;

  return (
    <nav className="top-0 z-40 mb-10">
      <div className="flex items-center justify-between bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/books" end className={linkClass}>
              Books
            </NavLink>
            <NavLink to="/books/favourites" className={linkClass}>
              Favourites
            </NavLink>
            <NavLink to="/books/reviews" className={linkClass}>
              Reviews
            </NavLink>
            {(auth.user?.role === 'admin' ||
              auth.user?.role === 'super admin') && (
              <NavLink to="/books/blacklisted" className={linkClass}>
                Blacklisted
              </NavLink>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!auth.user && (
            <>
              <NavLink to="/signup" className={linkClass}>
                Signup
              </NavLink>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            </>
          )}
          {auth.user && <SignoutButton />}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 px-2 flex flex-col gap-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-sm">
          <NavLink
            to="/books"
            end
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Books
          </NavLink>
          <NavLink
            to="/books/favourites"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Favourites
          </NavLink>
          <NavLink
            to="/books/reviews"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Reviews
          </NavLink>
          {(auth.user?.role === 'admin' ||
            auth.user?.role === 'super admin') && (
            <NavLink
              to="/books/blacklisted"
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              Blacklisted
            </NavLink>
          )}
          {!auth.user && (
            <>
              <NavLink
                to="/signup"
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                Signup
              </NavLink>
              <NavLink
                to="/login"
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </NavLink>
            </>
          )}
          {auth.user && <SignoutButton />}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
