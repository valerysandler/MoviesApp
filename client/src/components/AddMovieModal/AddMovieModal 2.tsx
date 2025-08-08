import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./AddMovieModal.module.scss";
import type { Movie } from "../../models/MovieModel";
import { checkMovieExists } from "../../services/MovieService";

type AddMovieModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Movie, posterFile?: File) => void;
  userId?: number;
};
  onClose: () => void;
  onSubmit: (data: Movie, posterFile?: File) => void;
  userId?: number;
};

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, onSubmit, userId }) => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
    setPreviewUrl(null);
    setCustomError(null);
    onClose();
  };

  const handleFormSubmit = async (data: Omit<Movie, 'poster'>) => {
    setCustomError(null);
    setIsLoading(true);

    try {
      // Проверка на дублирование в базе данных
      const exists = await checkMovieExists(data.title);
      if (exists) {
        setCustomError("A movie with the same name already exists.");
        setIsLoading(false);
        return;
      }

      if (!posterFile) {
        setCustomError("Please select a poster image.");
        setIsLoading(false);
        return;
      }

      // Создаем объект Movie с временным poster URL (будет заменен на сервере)
      const movieData: Movie = {
        ...data,
        poster: '', // Будет заполнено на сервере
        user_id: userId || 0,
      };

      onSubmit(movieData, posterFile);
      reset();
      setPosterFile(null);
      setPreviewUrl(null);
      setCustomError(null);
      handleClose();
    } catch (error) {
      console.error('Error checking movie existence:', error);
      setCustomError("Failed to check movie. Please try again.");
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
            {...register("title", { 
              required: "Title is required",
              maxLength: { value: 100, message: "Title must be less than 100 characters" },
              minLength: { value: 1, message: "Title cannot be empty" }
            })}
          />
          {errors.title && <p className={styles.error}>{errors.title.message}</p>}
          
          <input
            type="text"
            placeholder="Year (e.g., 2023)"
            {...register("year", { 
              required: "Year is required",
              pattern: { value: /^\d{4}$/, message: "Year must be a 4-digit number" },
              validate: {
                validRange: (value) => {
                  if (!value) return true; // Пропускаем, если значение пустое (обработается required)
                  const year = parseInt(value);
                  const currentYear = new Date().getFullYear();
                  return (year >= 1900 && year <= currentYear + 5) || "Year must be between 1900 and " + (currentYear + 5);
                }
              }
            })}
          />
          {errors.year && <p className={styles.error}>{errors.year.message}</p>}

          <input
            type="text"
            placeholder="Genre (e.g., Action, Drama)"
            {...register("genre", { 
              required: "Genre is required",
              minLength: { value: 2, message: "Genre must be at least 2 characters" },
              maxLength: { value: 50, message: "Genre must be less than 50 characters" }
            })}
          />
          {errors.genre && <p className={styles.error}>{errors.genre.message}</p>}
          
          <input
            type="text"
            placeholder="Runtime (e.g., 120 min)"
            {...register("runtime", { 
              required: "Runtime is required",
              pattern: { value: /^\d+\s*min?$/i, message: "Runtime must be in format '120 min' or '120'" }
            })}
          />
          {errors.runtime && <p className={styles.error}>{errors.runtime.message}</p>}

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
            {!posterFile && <p className={styles.error}>Poster image is required</p>}
            {previewUrl && (
              <div className={styles.previewWrapper}>
                <img src={previewUrl} alt="Poster preview" className={styles.previewImage} />
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Director"
            {...register("director", { 
              required: "Director is required",
              minLength: { value: 2, message: "Director name must be at least 2 characters" },
              maxLength: { value: 100, message: "Director name must be less than 100 characters" }
            })}
          />
          {errors.director && <p className={styles.error}>{errors.director.message}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add"}
          </button>
          <button type="button" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;
