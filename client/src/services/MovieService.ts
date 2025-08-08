import type { Movie } from "../models/MovieModel";


// services/MovieService.ts
export const searchMovies = async (query: string) => {
  const res = await fetch(`http://localhost:3000/api/movies/search?title=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json(); // или .results — зависит от API
};

export const fetchMovies = async () => {
  const res = await fetch('http://localhost:3000/api/movies');
  const data = await res.json();
  console.log('Fetched movies:', data);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return data;
};

export const addToFavorites = async (movie: Movie, username: string) => {
  const res = await fetch('http://localhost:3000/api/movies/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movie),
  });
  if (!res.ok) throw new Error('Failed to add movie to favorites');
  return res.json();
};

export const removeFromFavorites = async (movieId: number) => {
  const res = await fetch(`http://localhost:3000/api/movies/favorites/${movieId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove movie from favorites');
  return res.json();
};

export const addMovieWithImage = async (movie: Omit<Movie, 'id'>, imageFile: File): Promise<Movie> => {
  const formData = new FormData();
  
  // Добавляем данные фильма (с проверкой на undefined)
  formData.append('title', movie.title);
  if (movie.year) formData.append('year', movie.year);
  if (movie.genre) formData.append('genre', movie.genre);
  if (movie.runtime) formData.append('runtime', movie.runtime);
  if (movie.director) formData.append('director', movie.director);
  
  // Добавляем файл изображения
  formData.append('poster', imageFile);

  const res = await fetch('http://localhost:3000/api/movies', {
    method: 'POST',
    body: formData, // Не устанавливаем Content-Type, браузер сам установит для multipart/form-data
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Failed to add movie: ${errorData}`);
  }

  return res.json();
};

