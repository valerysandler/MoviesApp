import type { Movie } from "../models/MovieModel";


// services/MovieService.ts
export const searchMovies = async (query: string) => {
  const res = await fetch(`http://localhost:3000/api/movies/search?title=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json(); // или .results — зависит от API
};

export const fetchMovies = async () => {
  const res = await fetch('http://localhost:3000/api/movies');
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
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

