import React, { useState } from 'react';
import styles from './MovieList.module.scss';
import MovieCard from '../MovieCard/MovieCard';
import UsernameModal from '../UsernamModal/UsernameModal';
import type { Movie } from '../../models/MovieModel';
import { addToFavorites } from '../../services/MovieService';

interface MovieListProps {
  movies: Movie[];
  isFromDatabase?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({ movies, isFromDatabase = true }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFavoriteClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleSaveUsername = async (username: string) => {
    if (!selectedMovie) return;

    try {
      await addToFavorites(selectedMovie, username);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving favorite:', err);
    }
  };

  return (
    <>
      <div className={styles.moviesGrid}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onFavoriteClick={handleFavoriteClick}
            isFromDatabase={isFromDatabase}
          />
        ))}
      </div>

      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsername}
      />
    </>
  );
};

export default MovieList;
