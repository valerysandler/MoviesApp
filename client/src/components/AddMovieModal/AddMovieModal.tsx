import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./AddMovieModal.module.scss";
import type { Movie } from "../../models/MovieModel";

type AddMovieModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Movie, posterFile?: File) => void;
  existingTitles: string[];
};

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, onSubmit, existingTitles }) => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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

  const handleFormSubmit = (data: Omit<Movie, 'poster'>) => {
    if (existingTitles.includes(data.title.trim().toLowerCase())) {
      alert("A movie with the same name already exists.");
      return;
    }
    
    if (!posterFile) {
      alert("Please select a poster image.");
      return;
    }

    // Создаем объект Movie с временным poster URL (будет заменен на сервере)
    const movieData: Movie = {
      ...data,
      poster: '', // Будет заполнено на сервере
    };

    onSubmit(movieData, posterFile);
    reset();
    setPosterFile(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Add a Movie</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <input
            type="text"
            placeholder="Title"
            {...register("title", { required: true, maxLength: 100 })}
          />
          {errors.title && <p className={styles.error}>Title is required and must be less than 100 characters</p>}
          <input
            type="text"
            placeholder="Year"
            {...register("year", { required: true, pattern: /^\d{4}$/ })}
          />
          {errors.year && <p className={styles.error}>Year is required and must be a 4-digit number</p>}

          <input
            type="text"
            placeholder="Genre"
            {...register("genre", { required: true })}
          />
          {errors.genre && <p className={styles.error}>Genre is required</p>}
          <input
            type="text"
            placeholder="Runtime"
            {...register("runtime", { required: true })}
          />
          {errors.runtime && <p className={styles.error}>Runtime is required</p>}
          
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
            {...register("director", { required: true })}
          />
          {errors.director && <p className={styles.error}>Director is required</p>}
     
          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;
