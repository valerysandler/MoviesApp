import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home/Home';
import MovieDetails from './components/MovieDetails/MovieDetails';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>

        <ToastContainer />
      </div>
    </Router>
  )
}

export default App
