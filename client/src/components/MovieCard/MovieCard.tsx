import React from 'react';
import styles from './MovieCard.module.scss';
import type { Movie } from '../../models/MovieModel';

interface Props {
  movie: Movie;
}

const MovieCard: React.FC<Props> = ({ movie }) => {
  return (
    <div className={styles.movieCard}>
      <img src={movie.poster} alt={movie.title} className={styles.moviePoster} />
      <div className={styles.movieInfo}>
        <h2 className={styles.movieTitle}>{movie.title}</h2>
        <p className={styles.movieDetails}>
          {movie.year} | {movie.runtime} | {movie.genre}
        </p>
        <p className={styles.movieDetails}>Directed by: {movie.director}</p>
      </div>
    </div>
  );
};

export default MovieCard;
