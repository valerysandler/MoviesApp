import type { Movie } from "../models/MovieModel";

    export const getPosterUrl = (movie: Movie) => {
        if (movie.poster_local) {
            // Если уже абсолютный URL — оставляем как есть
            if (movie.poster_local.startsWith('http')) {
                return movie.poster_local;
            }
            // Добавляем базовый адрес API для локальных файлов
            return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${movie.poster_local}`;
        }

        return movie.poster; // Внешний URL из API
    };
