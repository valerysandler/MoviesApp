import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { searchMovies, fetchMovies } from '../../services/MovieService';
import type { Movie } from '../../models/MovieModel';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";


const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    loadMovies();
  }, []);

  const handleToggleFavorites = () => {
    setShowOnlyFavorites((prev) => !prev);
  };

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);

  const filteredMovies = showOnlyFavorites
    ? movies.filter((movie) => movie.is_favorite)
    : movies;

  const handleSearch = async (query: string) => {
    try {
      const data = await searchMovies(query);
      console.log(data)
      setMovies(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMovie = (newMovie: Movie) => {
    setMovies((prev) => [...prev, newMovie]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Movies</h1>
      <SearchBar onSearch={handleSearch} />
      <div className={styles.toolbar}>
        <button
          className={`${styles.iconButton} ${showOnlyFavorites ? styles.active : ''}`}
          onClick={handleToggleFavorites}
          aria-label="Toggle favorites"
        >
          {showOnlyFavorites ? '★' : '☆'}
          {showOnlyFavorites ? 'Show All' : 'Show Favorites'}
        </button>

        <button
          className={styles.iconButton}
          onClick={handleOpenAddModal}
          aria-label="Add new movie"
        >
          ＋
          Add Movie
        </button>
      </div>
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddMovie}
        existingTitles={movies.map(m => m.title.toLowerCase())}
      />
      {filteredMovies.length === 0 ? (
        <p className={styles.noMovies}>No movies found</p>
      ) : (
        <MovieList
          movies={filteredMovies}
          // showOnlyFavorites={showOnlyFavorites}
          // setMovies={setMovies}
        />
      )}
      <MovieList movies={movies} />

    </div>
  );
};

export default Home;
