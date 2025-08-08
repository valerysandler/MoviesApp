import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { searchMovies, fetchMovies, addMovieWithImage } from '../../services/MovieService';
import { useAuthAction } from '../../hooks/useAuthAction';
import UsernameModal from '../UsernamModal/UsernameModal';
import type { Movie } from '../../models/MovieModel';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";


const Home = () => {
  const [databaseMovies, setDatabaseMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const {
    executeWithAuth,
    showModal,
    handleUserSubmit,
    handleModalClose,
    user,
    error,
    successMessage
  } = useAuthAction();

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

  const handleOpenAddModal = () => {
    executeWithAuth(() => {
      setAddModalOpen(true);
    });
  };

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
      if (posterFile && user) {
        // Используем новую функцию с загрузкой файла
        const addedMovie = await addMovieWithImage(newMovie, posterFile, user.id.toString());
        setDatabaseMovies((prev: Movie[]) => [...prev, addedMovie]);
      } else {
        // Fallback на старую функцию (если нет файла)
        setDatabaseMovies((prev: Movie[]) => [...prev, newMovie]);
      }
      handleCloseAddModal();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    }
  };

  const handleMovieUpdated = (updatedMovie: Movie) => {
    setDatabaseMovies((prev: Movie[]) =>
      prev.map(movie => movie.id === updatedMovie.id ? updatedMovie : movie)
    );
  };

  const handleMovieDeleted = (movieId: number) => {
    setDatabaseMovies((prev: Movie[]) =>
      prev.filter(movie => movie.id !== movieId)
    );
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
        userId={user?.id}
      />

      <UsernameModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleUserSubmit}
        error={error}
        successMessage={successMessage}
      />

      {filteredMovies.length === 0 ? (
        <p className={styles.noMovies}>No movies found</p>
      ) : (
        <MovieList
          movies={filteredMovies}
          isFromDatabase={!isSearching}
          onMovieUpdated={handleMovieUpdated}
          onMovieDeleted={handleMovieDeleted}
        />
      )}

    </div>
  );
};

export default Home;
