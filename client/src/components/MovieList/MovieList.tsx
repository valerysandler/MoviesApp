import React from 'react';
import styles from './MovieList.module.scss';
import MovieCard from '../MovieCard/MovieCard';
import UsernameModal from '../UsernamModal/UsernameModal';
import { useAuthAction } from '../../hooks/useAuthAction';
import type { Movie } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { toggleFavoriteAsync } from '../../store/moviesSlice';

interface MovieListProps {
  movies: Movie[];
  isFromDatabase?: boolean;
  onMovieUpdated?: (updatedMovie: Movie) => void;
  onMovieDeleted?: (movieId: number) => void;
  onAddToDatabase?: (movie: Movie) => void;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  isFromDatabase = true,
  onMovieUpdated,
  onMovieDeleted,
  onAddToDatabase
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
        await dispatch(toggleFavoriteAsync({
          movieId: movie.id,
          userId: String(user.id)
        })).unwrap();
      } catch (err) {
        console.error('Error toggling favorite:', err);
        
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
