import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect } from 'react';
import { useAuthAction } from '../../hooks/useAuthAction';
import { useModal } from '../../hooks/useModal';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { useMovieOperations } from '../../hooks/useMovieOperations';
import { useMovieFiltering } from '../../hooks/useMovieFiltering';
import UsernameModal from '../UsernamModal/UsernameModal';
import type { Movie } from '../../types';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";
import { useAppDispatch } from '../../store/hooks';
import { fetchMoviesAsync } from '../../store/moviesSlice';

const Home = () => {
  const dispatch = useAppDispatch();

  // Custom hooks for separation of concerns
  const { filteredMovies, showOnlyFavorites, toggleFavoritesFilter, isSearching } = useMovieFiltering();
  const { handleSearch, handleClearSearch } = useMovieSearch();
  const { refreshMovies, addMovieWithFile, addMovieToDatabase } = useMovieOperations();
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();

  const {
    executeWithAuth,
    showModal,
    handleUserSubmit,
    handleModalClose,
    user,
    error,
    successMessage
  } = useAuthAction();

  // Load movies on component mount
  useEffect(() => {
    dispatch(fetchMoviesAsync());
  }, [dispatch]);

  // Reload movies when user changes (for favorites)
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchMoviesAsync());
    }
  }, [dispatch, user]);

  // Event handlers
  const handleOpenAddModal = () => {
    executeWithAuth(() => {
      openAddModal();
    });
  };

  const handleAddMovie = async (newMovie: Movie, posterFile?: File) => {
    try {
      await addMovieWithFile(newMovie, posterFile);
      closeAddModal();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    }
  };

  const handleAddToDatabase = async (movie: Movie) => {
    executeWithAuth(async () => {
      try {
        await addMovieToDatabase(movie);
      } catch (error) {
        console.error('Error adding movie to database:', error);
        alert('Failed to add movie to database. Please try again.');
      }
    });
  };

  return (
    <div className={styles.container}>
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

      <div className={styles.toolbar}>
        <button
          className={`${styles.iconButton} ${showOnlyFavorites ? styles.active : ''}`}
          onClick={toggleFavoritesFilter}
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
        onClose={closeAddModal}
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
          onMovieUpdated={refreshMovies}
          onMovieDeleted={refreshMovies}
          onAddToDatabase={handleAddToDatabase}
        />
      )}
    </div>
  );
};

export default Home;
