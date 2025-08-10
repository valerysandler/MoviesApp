import React from 'react';
import styles from './MovieList.module.scss';
import MovieCard from '../MovieCard/MovieCard';
import UsernameModal from '../UsernamModal/UsernameModal';
import { useAuthAction } from '../../hooks/useAuthAction';
import type { Movie } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { toggleFavorite } from '../../store/moviesSlice';

interface MovieListProps {
  movies: Movie[];
  isFromDatabase?: boolean;
  onMovieUpdated?: (updatedMovie: Movie) => void;
  onMovieDeleted?: (movieId: number) => void;
  onAddToDatabase?: (movie: Movie) => void;
  onAddToFavorites?: (movie: Movie, isFavorite: boolean) => void;
  isMovieAdded?: (movieTitle: string) => boolean;
  isAddingToDatabase?: (movieTitle: string) => boolean;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  isFromDatabase = true,
  onMovieUpdated,
  onMovieDeleted,
  onAddToDatabase,
  onAddToFavorites,
  isMovieAdded,
  isAddingToDatabase
}) => {
  const dispatch = useAppDispatch();
  const {
    executeWithAuth,
    showModal,
    handleUserSubmit,
    handleModalClose,
    user
  } = useAuthAction();

  const handleFavoriteClick = async (movie: Movie) => {
    executeWithAuth(async () => {
      if (!user) return;

      try {
        const result = await dispatch(toggleFavorite({
          movieId: movie.id,
          userId: String(user.id)
        })).unwrap();

        // Call the parent callback with notification
        if (onAddToFavorites) {
          onAddToFavorites(movie, result.isFavorite);
        }
      } catch (err) {
        // Silent error for favorite toggle
      }
    });
  };

  return (
    <>
      <div className={styles.moviesGrid}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onFavoriteClick={handleFavoriteClick}
            onMovieUpdated={onMovieUpdated}
            onMovieDeleted={onMovieDeleted}
            onAddToDatabase={onAddToDatabase}
            isFromDatabase={isFromDatabase}
            isMovieAdded={isMovieAdded ? isMovieAdded(movie.title) : false}
            isAddingToDatabase={isAddingToDatabase ? isAddingToDatabase(movie.title) : false}
          />
        ))}
      </div>

      <UsernameModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleUserSubmit}
      />
    </>
  );
};

export default MovieList;
