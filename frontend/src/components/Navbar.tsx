import { Link } from 'react-router-dom';
import SignoutButton from './SignoutButton';

const Navbar = () => {
  return (
    <nav className="text-blue-400 text-xl">
      <Link to="/">Home</Link>|<Link to="/books">Books</Link>|
      <Link to="/books/favourites">Favourites</Link>|
      <Link to="/signup">Signup</Link>|<Link to="/login">Login</Link>|
      <SignoutButton />
    </nav>
  );
};

export default Navbar;
