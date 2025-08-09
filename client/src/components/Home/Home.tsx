import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { searchMovies, addMovieWithImage } from '../../services/MovieService';
import { useAuthAction } from '../../hooks/useAuthAction';
import UsernameModal from '../UsernamModal/UsernameModal';
import type { Movie } from '../../types';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMoviesAsync,
  setSearchResults,
  clearSearch,
  addMovieToDatabaseAsync
} from '../../store/moviesSlice';


const Home = () => {
  const dispatch = useAppDispatch();
  const { movies, searchResults, isSearching } = useAppSelector(state => state.movies);
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
    dispatch(fetchMoviesAsync());
  }, [dispatch]);

  // When user changes, reload movies to apply saved favorites
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchMoviesAsync());
    }
  }, [dispatch, user]);

  const handleToggleFavorites = () => {
    setShowOnlyFavorites((prev) => !prev);
  };

  const handleOpenAddModal = () => {
    executeWithAuth(() => {
      setAddModalOpen(true);
    });
  };

  const handleCloseAddModal = () => setAddModalOpen(false);

  const currentMovies = isSearching ? searchResults : movies;
  const filteredMovies = showOnlyFavorites
    ? currentMovies.filter((movie: Movie) => movie.is_favorite)
    : currentMovies;

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      dispatch(clearSearch());
      return;
    }

    try {
      const data = await searchMovies(query);
      console.log(data);
      dispatch(setSearchResults(data));
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearSearch = () => {
    dispatch(clearSearch());
  };

  const handleAddMovie = async (newMovie: Movie, posterFile?: File) => {
    try {
      if (posterFile && user) {
        // Используем новую функцию с загрузкой файла
        await addMovieWithImage(newMovie, posterFile, user.id.toString());
        dispatch(fetchMoviesAsync()); // Перезагружаем фильмы
      } else {
        // Fallback: добавляем фильм без файла
        console.log('Adding movie without file:', newMovie);
      }
      handleCloseAddModal();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    }
  };

  const handleMovieUpdated = () => {
    // Обновление будет происходить через Redux в MovieList
    dispatch(fetchMoviesAsync());
  };

  const handleMovieDeleted = () => {
    // Удаление будет происходить через Redux в MovieList
    dispatch(fetchMoviesAsync());
  };

  const handleAddToDatabase = async (movie: Movie) => {
    if (!user) return;

    executeWithAuth(async () => {
      try {
        await dispatch(addMovieToDatabaseAsync({ movie, userId: user.id.toString() })).unwrap();
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
          onAddToDatabase={handleAddToDatabase}
        />
      )}

    </div>
  );
};

export default Home;
