import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MovieCard.module.scss';
import type { Movie } from '../../types';
import { getPosterUrl } from '../../utils/imageUtils';
import EditMovieModal from '../EditMovieModal/EditMovieModal';
import UsernameModal from '../UsernamModal/UsernameModal';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
import { useAuthAction } from '../../hooks/useAuthAction';
import { useNotification } from '../../hooks/useNotification';
import { deleteMovie } from '../../services/movieService.js';

interface MovieCardProps {
    movie: Movie;
    onFavoriteClick: (movie: Movie) => void;
    onMovieUpdated?: (updatedMovie: Movie) => void;
    onMovieDeleted?: (movieId: number) => void;
    onAddToDatabase?: (movie: Movie) => void;
    isFromDatabase?: boolean;
    isMovieAdded?: boolean;
    isAddingToDatabase?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
    movie,
    onFavoriteClick,
    onMovieUpdated,
    onMovieDeleted,
    onAddToDatabase,
    isFromDatabase = true,
    isMovieAdded = false,
    isAddingToDatabase = false
}) => {
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        executeWithAuth,
        showModal,
        handleUserSubmit,
        handleModalClose
    } = useAuthAction();

    const { showError } = useNotification();

    const handleMovieClick = () => {
        if (isFromDatabase && movie.id) {
            navigate(`/movie/${movie.id}`);
        }
    };

    const handleFavoriteClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (!isFromDatabase) return;

        onFavoriteClick(movie);
    };

    const handleEditClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        executeWithAuth(() => {
            setIsEditModalOpen(true);
        });
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
    };

    const handleMovieUpdated = (updatedMovie: Movie) => {
        setIsEditModalOpen(false);
        if (onMovieUpdated) {
            onMovieUpdated(updatedMovie);
        }
    };

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        executeWithAuth(() => {
            setIsDeleteConfirmOpen(true);
        });
    };

    const handleDeleteConfirm = async () => {
        if (!movie.id || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteMovie(movie.id);
            setIsDeleteConfirmOpen(false);
            if (onMovieDeleted) {
                onMovieDeleted(movie.id);
            }
        } catch (error) {
            showError('Failed to delete movie. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    const handleAddToDatabase = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (isMovieAdded || !onAddToDatabase) return;

        executeWithAuth(() => {
            onAddToDatabase(movie);
        });
    };

    return (
        <>
            <div className={styles.movieCard}>
                {isFromDatabase ? (
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
                ) : (
                    <div className={styles.actions}>
                        <button
                            className={`${styles.actionButton} ${isMovieAdded ? styles.addedButton : styles.addButton}`}
                            onClick={handleAddToDatabase}
                            aria-label={isMovieAdded ? "Already added" : isAddingToDatabase ? "Adding..." : "Add to database"}
                            title={isMovieAdded ? "Already in your collection" : isAddingToDatabase ? "Adding to collection..." : "Add to my movies"}
                            disabled={isMovieAdded || isAddingToDatabase}
                            style={{
                                pointerEvents: (isMovieAdded || isAddingToDatabase) ? 'none' : 'auto',
                                opacity: isAddingToDatabase ? 0.7 : 1
                            }}
                        >
                            {isMovieAdded ? '✓' : isAddingToDatabase ? '⏳' : '＋'}
                        </button>
                    </div>
                )}

                <img
                    src={getPosterUrl(movie)}
                    alt={movie.title}
                    className={styles.moviePoster}
                    onClick={handleMovieClick}
                    style={{ cursor: isFromDatabase ? 'pointer' : 'default' }}
                />
                <div className={styles.movieInfo}>
                    <h2
                        className={styles.movieTitle}
                        onClick={handleMovieClick}
                        style={{ cursor: isFromDatabase ? 'pointer' : 'default' }}
                    >
                        {movie.title}
                    </h2>
                    <p className={styles.movieDetails}>
                        {movie.year} | {movie.runtime} | {movie.genre}
                    </p>
                    <p className={styles.movieDetails}>Directed by: {movie.director}</p>
                </div>
            </div>

            {isEditModalOpen && (
                <EditMovieModal
                    movie={movie}
                    isOpen={isEditModalOpen}
                    onClose={handleEditClose}
                    onSubmit={handleMovieUpdated}
                />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Movie"
                itemName={movie.title}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isLoading={isDeleting}
                loadingText="Deleting..."
                confirmText="Delete"
                cancelText="Cancel"
            />

            <UsernameModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSave={handleUserSubmit}
            />
        </>
    );
};


export default MovieCard;

