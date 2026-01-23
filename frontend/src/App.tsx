import { Routes, Route } from 'react-router-dom';
import Books from './pages/Books';
import BookDatails from './pages/BookDatails';
import Navbar from './components/Navbar';
import './App.css';
import Signup from './pages/SignupPage';
import ToggleThemes from './components/ToggleThemes';

function App() {
  return (
    <>
      <Navbar />
      <ToggleThemes />
      <Routes>
        <Route path="/" element={<Books />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:olid" element={<BookDatails />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
