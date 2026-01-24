import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="text-blue-400 text-xl">
      <Link to="/">Home</Link>|<Link to="/books">Books</Link>|
      <Link to="/signup">Signup</Link>|<Link to="/login">Login</Link>
    </nav>
  );
};

export default Navbar;
