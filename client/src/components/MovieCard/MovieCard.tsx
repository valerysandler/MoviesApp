import React from 'react';
import styles from './MovieCard.module.scss';
import type { Movie } from '../../models/MovieModel';

interface MovieCardProps {
    movie: Movie;
    onFavoriteClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onFavoriteClick }) => {
    return (
        <div className={styles.movieCard}>
            {/* <button
                className={styles.favoriteButton}
                onClick={() => onFavoriteClick(movie)}
                aria-label="Toggle Favorite"
            >
                {movie.is_favorite ? '★' : '☆'}
            </button> */}
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

