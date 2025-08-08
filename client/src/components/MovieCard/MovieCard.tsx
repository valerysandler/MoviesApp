import React from 'react';
import styles from './MovieCard.module.scss';
import type { Movie } from '../../models/MovieModel';
import { getPosterUrl } from '../../utils/imageUtils';

interface MovieCardProps {
    movie: Movie;
    onFavoriteClick: (movie: Movie) => void;
    isFromDatabase?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onFavoriteClick, isFromDatabase = true }) => {

    const handleFavoriteClick = () => {
        if (isFromDatabase) {
            onFavoriteClick(movie);
        }
    };

    const handleEditClick = () => {
        // TODO: Implement edit functionality
        console.log('Edit movie:', movie.title);
    };

    const handleDeleteClick = () => {
        // TODO: Implement delete functionality  
        console.log('Delete movie:', movie.title);
    };

    return (
        <div className={styles.movieCard}>
            {isFromDatabase && (
                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={handleFavoriteClick}
                        aria-label="Add to favorites"
                        title="Add to favorites"
                    >
                        {movie.is_favorite ? '★' : '☆'}
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={handleEditClick}
                        aria-label="Edit movie"
                        title="Edit movie"
                    >
                        ✏️
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={handleDeleteClick}
                        aria-label="Delete movie"
                        title="Delete movie"
                    >
                        🗑️
                    </button>
                </div>
            )}

            <img
                src={getPosterUrl(movie)}
                alt={movie.title}
                className={styles.moviePoster}
            />
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

