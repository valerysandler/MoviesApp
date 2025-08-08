import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { searchMovies, fetchMovies, addMovieWithImage } from '../../services/MovieService';
import type { Movie } from '../../models/MovieModel';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";


const Home = () => {
  const [databaseMovies, setDatabaseMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies();
        setDatabaseMovies(data);
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

  const currentMovies = isSearching ? searchResults : databaseMovies;
  const filteredMovies = showOnlyFavorites
    ? currentMovies.filter((movie: Movie) => movie.is_favorite)
    : currentMovies;

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      const data = await searchMovies(query);
      console.log(data);
      setSearchResults(data);
      setIsSearching(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleAddMovie = async (newMovie: Movie, posterFile?: File) => {
    try {
      if (posterFile) {
        // Используем новую функцию с загрузкой файла
        const addedMovie = await addMovieWithImage(newMovie, posterFile);
        setDatabaseMovies((prev: Movie[]) => [...prev, addedMovie]);
      } else {
        // Fallback на старую функцию (если нет файла)
        setDatabaseMovies((prev: Movie[]) => [...prev, newMovie]);
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Movies</h1>
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
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
        existingTitles={databaseMovies.map((m: Movie) => m.title.toLowerCase())}
      />
      {filteredMovies.length === 0 ? (
        <p className={styles.noMovies}>No movies found</p>
      ) : (
        <MovieList
          movies={filteredMovies}
          isFromDatabase={!isSearching}
        />
      )}

    </div>
  );
};

export default Home;
