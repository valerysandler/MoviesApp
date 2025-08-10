import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MovieDetails.module.scss';
import type { Movie } from '../../models/MovieModel';
import { getPosterUrl } from '../../utils/imageUtils';
import { fetchMovies, toggleFavorite } from '../../services/MovieService';
import { useAuthAction } from '../../hooks/useAuthAction';
import UsernameModal from '../UsernamModal/UsernameModal';
import EditMovieModal from '../EditMovieModal/EditMovieModal';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
import { deleteMovie } from '../../services/MovieService';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    executeWithAuth,
    showModal,
    handleUserSubmit,
    handleModalClose,
    user
  } = useAuthAction();

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const movies = await fetchMovies();
        const foundMovie = movies.find((m: Movie) => m.id === parseInt(id));
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Error loading movie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  const handleFavoriteClick = async () => {
    if (!movie || !user) return;

    executeWithAuth(async () => {
      try {
        const updatedMovie = await toggleFavorite(movie.id, String(user.id));
        if (typeof updatedMovie === 'object' && updatedMovie !== null) {
          setMovie(updatedMovie);
        } else {
          // fallback: reload movies or show error
          setError('Failed to update favorite status. Please try again.');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorite status. Please try again.');
      }
    });
  };

  const handleEditClick = () => {
    executeWithAuth(() => {
      setIsEditModalOpen(true);
    });
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  const handleMovieUpdated = (updatedMovie: Movie) => {
    setMovie(updatedMovie);
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = () => {
    executeWithAuth(() => {
      setIsDeleteConfirmOpen(true);
    });
  };

  const handleDeleteConfirm = async () => {
    if (!movie?.id || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteMovie(movie.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>{error || 'Movie not found'}</h2>
          <button onClick={handleBack} className={styles.backButton}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Movies
        </button>

        <div className={styles.movieHero}>
          <div className={styles.posterSection}>
            <img
              src={getPosterUrl(movie)}
              alt={movie.title}
              className={styles.posterLarge}
            />
          </div>

          <div className={styles.detailsSection}>
            <h1 className={styles.title}>{movie.title}</h1>
            
            <div className={styles.metadata}>
              <span className={styles.year}>{movie.year}</span>
              <span className={styles.runtime}>{movie.runtime}</span>
              <span className={styles.genre}>{movie.genre}</span>
            </div>

            <div className={styles.director}>
              <strong>Directed by:</strong> {movie.director}
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleFavoriteClick}
                className={`${styles.favoriteButton} ${movie.is_favorite ? styles.isFavorite : ''}`}
              >
                {movie.is_favorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
              </button>

              <button
                onClick={handleEditClick}
                className={styles.editButton}
              >
                ✏️ Edit Movie
              </button>

              <button
                onClick={handleDeleteClick}
                className={styles.deleteButton}
              >
                🗑️ Delete Movie
              </button>
            </div>
          </div>
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

export default MovieDetails;
