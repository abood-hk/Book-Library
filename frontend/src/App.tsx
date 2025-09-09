import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDatails from './pages/BookDatails';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:olid" element={<BookDatails />} />
      </Routes>
    </>
  );
}

export default App;
