import React from 'react';
import styles from './MovieList.module.scss';
import MovieCard from '../MovieCard/MovieCard';
import type { Movie } from '../../models/MovieModel';

interface Props {
  movies: Movie[];
}

const MovieList: React.FC<Props> = ({ movies }) => {
  return (
    <div className={styles.moviesGrid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;
