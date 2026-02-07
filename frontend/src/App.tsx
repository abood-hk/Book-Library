import { Routes, Route, Navigate } from 'react-router-dom';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Navbar from './components/Navbar';
import './App.css';
import Signup from './pages/SignupPage';
import Login from './pages/LoginPage';
import { AuthProvider } from './context/AuthProvider';
import FavouriteBooks from './pages/FavouriteBooks';
import ReviewedBooks from './pages/ReviewedBooks';
import BlacklistedBooks from './pages/BlacklistedBooks';
import ToggleThemes from './components/ToggleThemes';

function App() {
  return (
    <>
      <ToggleThemes />
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:olid" element={<BookDetails />} />
          <Route path="/books/favourites" element={<FavouriteBooks />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books/reviews" element={<ReviewedBooks />} />
          <Route path="/books/blacklisted" element={<BlacklistedBooks />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
