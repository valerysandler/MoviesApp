import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./AddMovieModal.module.scss";
import type { Movie } from "../../types";
import { checkMovieExists, addMovieWithImage } from "../../services/movieService";
import { useAppDispatch } from "../../store/hooks";
import { fetchMovies } from "../../store/moviesSlice";
import { useUser } from "../../hooks/useUser";
import { useNotification } from "../../hooks/useNotification";
import { movieValidationRules } from "../../utils/formValidation";

type AddMovieModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded?: () => void;
};

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, onMovieAdded }) => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<Movie, 'poster'>>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClose = () => {
    reset();
    setPosterFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCustomError(null);
    onClose();
  };

  const handleFormSubmit = async (data: Omit<Movie, 'poster'>) => {
    setCustomError(null);
    setIsLoading(true);

    try {
      if (!posterFile) {
        setCustomError("Please select a poster image.");
        setIsLoading(false);
        return;
      }

      if (!user) {
        showError('Please login to add movies');
        setIsLoading(false);
        return;
      }

      // Check if movie exists
      const exists = await checkMovieExists(data.title, user.username);
      if (exists) {
        setCustomError("A movie with the same name already exists.");
        setIsLoading(false);
        return;
      }

      // Add movie
      const movieData: Movie = {
        ...data,
        poster: '',
        user_id: user.id,
      };

      await addMovieWithImage(movieData, posterFile, user.id.toString());
      showSuccess(`🎬 "${data.title}" added!`);

      // Use callback if provided, otherwise fallback to dispatch
      if (onMovieAdded) {
        onMovieAdded();
      } else {
        dispatch(fetchMovies());
      }

      handleClose();
    } catch (error) {
      console.error('Error adding movie:', error);
      showError("Failed to add movie. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Add a Movie</h2>
        {customError && <p className={styles.error}>{customError}</p>}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <input
            type="text"
            placeholder="Title"
            {...register("title", movieValidationRules.title)}
          />
          {errors.title && <p className={styles.error}>{errors.title.message}</p>}

          <input
            type="text"
            placeholder="Year (e.g., 2023)"
            {...register("year", movieValidationRules.year)}
          />
          {errors.year && <p className={styles.error}>{errors.year.message}</p>}

          <input
            type="text"
            placeholder="Genre (e.g., Action, Drama)"
            {...register("genre", movieValidationRules.genre)}
          />
          {errors.genre && <p className={styles.error}>{errors.genre.message}</p>}

          <input
            type="text"
            placeholder="Runtime (e.g., 120 min)"
            {...register("runtime", movieValidationRules.runtime)}
          />
          {errors.runtime && <p className={styles.error}>{errors.runtime.message}</p>}

          <input
            type="text"
            placeholder="Director"
            {...register("director", movieValidationRules.director)}
          />
          {errors.director && <p className={styles.error}>{errors.director.message}</p>}

          <div className={styles.fileInputWrapper}>
            <label htmlFor="posterFile" className={styles.fileLabel}>
              Choose Poster Image
            </label>
            <input
              id="posterFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {posterFile && (
              <p className={styles.fileName}>{posterFile.name}</p>
            )}

            {previewUrl && (
              <div className={styles.previewWrapper}>
                <img src={previewUrl} alt="Poster preview" className={styles.previewImage} />
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button type="button" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;
