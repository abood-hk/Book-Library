import { NavLink } from 'react-router-dom';
import SignoutButton from './SignoutButton';
import useAuth from '../hooks/UseAuth';

const Navbar = () => {
  const { auth } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition
     ${
       isActive
         ? 'bg-indigo-600 text-white'
         : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-muted))]'
     }`;

  return (
    <nav className="sticky top-0 z-40 mb-10">
      <div
        className="flex items-center justify-between
                   bg-[rgb(var(--card))]
                   border border-[rgb(var(--border))]
                   rounded-xl px-4 py-3
                   shadow-sm"
      >
        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-2">
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
          <SignoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
