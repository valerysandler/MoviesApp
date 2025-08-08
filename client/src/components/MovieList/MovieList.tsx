import React from 'react';
import styles from './MovieList.module.scss';
import MovieCard from '../MovieCard/MovieCard';
import UsernameModal from '../UsernamModal/UsernameModal';
import { useAuthAction } from '../../hooks/useAuthAction';
import type { Movie } from '../../models/MovieModel';
import { toggleFavorite } from '../../services/MovieService';

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
        // Используем новую систему избранных с user ID
        const newFavoriteStatus = await toggleFavorite(movie.id, user.username);
        console.log(`Movie ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`);

        // Обновляем локальное состояние фильма
        if (onMovieUpdated) {
          const updatedMovie = { ...movie, is_favorite: newFavoriteStatus };
          onMovieUpdated(updatedMovie);
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        alert('Failed to update favorite status. Please try again.');
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
