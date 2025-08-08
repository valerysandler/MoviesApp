import React from "react";
import { useForm } from "react-hook-form";
import styles from "./AddMovieModal.module.scss";
import type { Movie } from "../../models/MovieModel";

type AddMovieModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Movie) => void;
  existingTitles: string[];
};

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, onSubmit, existingTitles }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Movie>();

  const handleFormSubmit = (data: Movie) => {
    if (existingTitles.includes(data.title.trim().toLowerCase())) {
      alert("A movie with the same name already exists.");
      return;
    }
    onSubmit(data);
    reset();
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
          <input
            type="text"
            placeholder="Poster URL"
            {...register("poster", { required: true })}
          />
          {errors.poster && <p className={styles.error}>Poster URL is required</p>}
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
