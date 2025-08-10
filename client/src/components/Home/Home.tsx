import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { useAuthAction } from '../../hooks/useAuthAction';
import UsernameModal from '../UsernamModal/UsernameModal';
import type { Movie } from '../../types';
import MovieList from '../MovieList/MovieList';
import AddMovieModal from "../AddMovieModal/AddMovieModal";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMovies, setSearchResults, clearSearch } from '../../store/moviesSlice';
import { searchMovies, addMovieToDatabase, checkMovieExists } from '../../services/movieService';
import { useNotification } from '../../hooks/useNotification';

const Home = () => {
  const dispatch = useAppDispatch();
  const { movies, searchResults, isSearching } = useAppSelector(state => state.movies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [addedMovieTitles, setAddedMovieTitles] = useState<Set<string>>(new Set());
  const [addingMovieId, setAddingMovieId] = useState<string | null>(null);

  const {
    executeWithAuth,
    showModal,
    handleUserSubmit,
    handleModalClose,
    user,
    error
  } = useAuthAction();

  const { showSuccess, showError } = useNotification();

  const currentMovies = isSearching ? searchResults : movies;
  const filteredMovies = showOnlyFavorites
    ? currentMovies.filter((movie: Movie) => movie.is_favorite)
    : currentMovies;

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchMovies());
    }
  }, [dispatch, user]);

  const handleOpenAddModal = () => {
    executeWithAuth(() => {
      setIsAddModalOpen(true);
    });
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const toggleFavoritesFilter = () => setShowOnlyFavorites(prev => !prev);

  const handleSearch = async (query: string) => {
    setCurrentSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchMovies(query);

        const existingMovies = new Set<string>();
        console.log('Current user for checking movies:', user?.username);
        await Promise.all(
          results.map(async (movie: Movie) => {
            try {
              console.log(`Checking movie: ${movie.title} for user: ${user?.username}`);
              const exists = await checkMovieExists(movie.title, user?.username);
              console.log(`Movie ${movie.title} exists: ${exists}`);
              if (exists) {
                existingMovies.add(movie.title);
              }
            } catch (error) {
              console.error('Error checking movie:', error);
            }
          })
        );

        setAddedMovieTitles(existingMovies);
        dispatch(setSearchResults(results));
      } catch (error) {
        const filtered = movies.filter((movie: Movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        );
        dispatch(setSearchResults(filtered));
      }
    } else {
      dispatch(clearSearch());
      setAddedMovieTitles(new Set());
    }
  };

  const handleClearSearch = () => {
    setCurrentSearchQuery('');
    setAddedMovieTitles(new Set());
    dispatch(clearSearch());
  };

  const refreshMovies = async () => {
    // Always refresh the main movies list
    dispatch(fetchMovies());

    // If we're currently searching, re-run the search to include new movies
    if (isSearching && currentSearchQuery.trim()) {
      try {
        const results = await searchMovies(currentSearchQuery);
        dispatch(setSearchResults(results));
      } catch (error) {
        // Silent error for search refresh
      }
    }
  };

  const handleAddToDatabase = async (movie: Movie) => {
    if (!user) {
      showError('Please login to add movies');
      return;
    }

    setAddingMovieId(movie.title);

    try {
      // Immediately update UI for better UX
      setAddedMovieTitles(prev => new Set([...prev, movie.title]));

      const { id, ...movieData } = movie;
      await addMovieToDatabase(movieData, user.id.toString());
      showSuccess(`🎬 "${movie.title}" added to your collection!`);

      // Refresh movies in background
      refreshMovies();
    } catch (error) {
      // Revert UI change if failed
      setAddedMovieTitles(prev => {
        const newSet = new Set(prev);
        newSet.delete(movie.title);
        return newSet;
      });
      showError('Failed to add movie. Please try again.');
    } finally {
      setAddingMovieId(null);
    }
  };

  const isMovieAdded = (movieTitle: string) => {
    return addedMovieTitles.has(movieTitle);
  };

  const isAddingMovie = (movieTitle: string) => {
    return addingMovieId === movieTitle;
  };

  const handleEditMovie = (updatedMovie: Movie) => {
    showSuccess(`✏️ "${updatedMovie.title}" updated successfully!`);
    refreshMovies();
  };

  const handleDeleteMovie = (movieId: number) => {
    const deletedMovie = filteredMovies.find(m => m.id === movieId);
    if (deletedMovie) {
      showSuccess(`🗑️ "${deletedMovie.title}" deleted successfully!`);
    }
    refreshMovies();
  };

  const handleAddToFavorites = (movie: Movie, isFavorite: boolean) => {
    if (isFavorite) {
      showSuccess(`⭐ "${movie.title}" added to favorites!`);
    } else {
      showSuccess(`☆ "${movie.title}" removed from favorites!`);
    }
    // Don't refresh movies - Redux already updated the state
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
        onMovieAdded={refreshMovies}
      />

      <UsernameModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleUserSubmit}
        error={error}
      />

      {filteredMovies.length === 0 ? (
        <p className={styles.noMovies}>No movies found</p>
      ) : (
        <MovieList
          movies={filteredMovies}
          isFromDatabase={!isSearching}
          onMovieUpdated={handleEditMovie}
          onMovieDeleted={handleDeleteMovie}
          onAddToDatabase={handleAddToDatabase}
          onAddToFavorites={handleAddToFavorites}
          isMovieAdded={isMovieAdded}
          isAddingToDatabase={isAddingMovie}
        />
      )}
    </div>
  );
};

export default Home;
