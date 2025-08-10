import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./EditMovieModal.module.scss";
import type { Movie } from "../../types";
import { getPosterUrl } from "../../utils/imageUtils";
import { updateMovie, updateMovieWithImage } from "../../services/MovieService";

type EditMovieModalProps = {
    isOpen: boolean;
    movie: Movie | null;
    onClose: () => void;
    onSubmit: (updatedMovie: Movie) => void;
};

const EditMovieModal: React.FC<EditMovieModalProps> = ({ isOpen, movie, onClose, onSubmit }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<Omit<Movie, 'id' | 'user_id' | 'poster' | 'poster_local' | 'external_id' | 'is_favorite'>>();

    // Предзаполняем форму данными фильма
    useEffect(() => {
        if (movie && isOpen) {
            setValue("title", movie.title);
            setValue("year", movie.year || "");
            setValue("genre", movie.genre || "");
            setValue("runtime", movie.runtime || "");
            setValue("director", movie.director || "");
        }
    }, [movie, isOpen, setValue]);

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
        setCustomError(null);
        setPosterFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        onClose();
    };

    const handleFormSubmit = async (data: Omit<Movie, 'id' | 'user_id' | 'poster' | 'poster_local' | 'external_id' | 'is_favorite'>) => {
        if (!movie) return;

        setCustomError(null);
        setIsLoading(true);

        try {
            // Создаем обновленный объект фильма
            const updatedMovieData: Movie = {
                ...movie,
                ...data,
            };

            let updatedMovie: Movie;

            // Выбираем правильную функцию в зависимости от наличия файла
            if (posterFile) {
                updatedMovie = await updateMovieWithImage(updatedMovieData, posterFile);
            } else {
                updatedMovie = await updateMovie(updatedMovieData);
            }

            onSubmit(updatedMovie);
            handleClose();
        } catch (error) {
            console.error('Error updating movie:', error);
            setCustomError("Failed to update movie. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !movie) return null;

    return (
        <div className={styles.modalBackdrop} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Edit Movie</h2>
                {customError && <p className={styles.error}>{customError}</p>}
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <input
                        type="text"
                        placeholder="Title"
                        {...register("title", {
                            required: "Title is required",
                            minLength: { value: 3, message: "Title must be at least 3 characters" },
                            maxLength: { value: 100, message: "Title must be less than 100 characters" }
                        })}
                    />
                    {errors.title && <p className={styles.error}>{errors.title.message}</p>}

                    <input
                        type="text"
                        placeholder="Year (e.g., 2023)"
                        {...register("year", {
                            required: "Year is required",
                            pattern: { value: /^\d{4}$/, message: "Year must be a valid 4-digit number" },
                            validate: {
                                validRange: (value) => {
                                    if (!value) return true;
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
                        placeholder="Genre (e.g., Action, Drama, Sci-Fi)"
                        {...register("genre", {
                            required: "Genre is required",
                            minLength: { value: 3, message: "Genre must be at least 3 characters" },
                            maxLength: { value: 100, message: "Genre must be less than 100 characters" }
                        })}
                    />
                    {errors.genre && <p className={styles.error}>{errors.genre.message}</p>}

                    <input
                        type="text"
                        placeholder="Runtime (e.g., 120 min)"
                        {...register("runtime", {
                            required: "Runtime is required",
                            minLength: { value: 3, message: "Runtime must be at least 3 characters" },
                            pattern: { value: /^\d+\s*min?$/i, message: "Runtime must be in format '120 min' or '120'" }
                        })}
                    />
                    {errors.runtime && <p className={styles.error}>{errors.runtime.message}</p>}

                    <input
                        type="text"
                        placeholder="Director"
                        {...register("director", {
                            required: "Director is required",
                            minLength: { value: 3, message: "Director name must be at least 3 characters" },
                            maxLength: { value: 100, message: "Director name must be less than 100 characters" }
                        })}
                    />
                    {errors.director && <p className={styles.error}>{errors.director.message}</p>}

                    {/* Poster Upload Section */}
                    <div className={styles.fileSection}>
                        <label htmlFor="poster" className={styles.fileLabel}>
                            Update Poster (Optional)
                        </label>
                        <input
                            id="poster"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className={styles.fileInput}
                        />

                        {/* Current Poster Preview */}
                        {!previewUrl && movie && (
                            <div className={styles.currentPoster}>
                                <p className={styles.currentPosterLabel}>Current poster:</p>
                                <img src={getPosterUrl(movie)} alt="Current poster" className={styles.currentPosterImage} />
                            </div>
                        )}

                        {/* New Poster Preview */}
                        {previewUrl && (
                            <div className={styles.posterPreview}>
                                <p className={styles.previewLabel}>New poster preview:</p>
                                <img src={previewUrl} alt="New poster preview" className={styles.previewImage} />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPosterFile(null);
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null);
                                    }}
                                    className={styles.removeButton}
                                >
                                    Remove new poster
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" disabled={isLoading} className={styles.saveButton}>
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={handleClose} disabled={isLoading} className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMovieModal;
