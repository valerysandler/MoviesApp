import React from 'react';
import styles from './MovieCard.module.scss';
import type { Movie } from '../../models/MovieModel';
import { addToFavorites } from '../../services/MovieService';

interface Props {
    movie: Movie;
    username: string;
    onToggleFavorite: (id: number, isFavorite: boolean) => void;


}

const MovieCard: React.FC<Props> = ({ movie }) => {

    const handleFavoriteClick = async () => {
        try {
            // вызов API для переключения избранного
            await addToFavorites(movie);
            onToggleFavorite(movie.id, !movie.is_favorite);
        } catch (error) {
            console.error('Favorite toggle failed', error);
        }
    };

    return (
        <div className={styles.movieCard}>
            <button
                className={styles.favoriteButton}
                onClick={handleFavoriteClick}
                aria-label="Toggle Favorite"
            >
                {movie.is_favorite ? '★' : '☆'}
            </button>
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
function onToggleFavorite(id: number, arg1: boolean) {
    throw new Error('Function not implemented.');
}

