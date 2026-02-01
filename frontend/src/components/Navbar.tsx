import { Link } from 'react-router-dom';
import SignoutButton from './SignoutButton';
import useAuth from '../hooks/UseAuth';

const Navbar = () => {
  const { auth } = useAuth();
  return (
    <nav className="text-blue-400 text-xl">
      <Link to="/">Home</Link>|<Link to="/books">Books</Link>|
      <Link to="/books/favourites">Favourites</Link>|
      <Link to="/books/reviews">Reviewed</Link>
      {(auth.user?.role === 'admin' || auth.user?.role === 'super admin') && (
        <>
          |<Link to="/books/blacklisted">Blacklisted</Link>
        </>
      )}
      |<Link to="/signup">Signup</Link>|<Link to="/login">Login</Link>|
      <SignoutButton />
    </nav>
  );
};

export default Navbar;
