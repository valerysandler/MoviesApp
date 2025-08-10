/**
 * Simplified Movie Service - functions instead of class
 */

import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import type { Movie, MovieFormData } from '../types';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

const createFormData = (movieData: any, userId?: string, imageFile?: File): FormData => {
  const formData = new FormData();

  if (movieData.title) formData.append('title', movieData.title);
  if (movieData.year) formData.append('year', movieData.year);
  if (movieData.genre) formData.append('genre', movieData.genre);
  if (movieData.runtime) formData.append('runtime', movieData.runtime);
  if (movieData.director) formData.append('director', movieData.director);
  if (userId) formData.append('user_id', userId);
  if (imageFile) formData.append('poster', imageFile);

  return formData;
};

export const fetchMovies = async (): Promise<Movie[]> => {
  const response = await api.get<Movie[]>(API_CONFIG.ENDPOINTS.MOVIES);
  return response.data;
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query.trim()) return [];
  const response = await api.get<Movie[]>(`${API_CONFIG.ENDPOINTS.SEARCH}?title=${encodeURIComponent(query.trim())}`);
  return response.data;
};

export const getMovieById = async (movieId: number): Promise<Movie> => {
  const response = await api.get<Movie>(`${API_CONFIG.ENDPOINTS.MOVIES}/${movieId}`);
  return response.data;
};

export const addMovieWithImage = async (movie: MovieFormData, file: File, userId: string): Promise<Movie> => {
  const formData = createFormData(movie, userId, file);
  const response = await api.post<Movie>(API_CONFIG.ENDPOINTS.MOVIES, formData);
  return response.data;
};

export const addMovieToDatabase = async (movie: MovieFormData, userId: string): Promise<Movie> => {
  const response = await api.post<Movie>(API_CONFIG.ENDPOINTS.MOVIES, { ...movie, user_id: userId });
  return response.data;
};

export const updateMovie = async (movie: Movie): Promise<Movie> => {
  const response = await api.put<Movie>(`${API_CONFIG.ENDPOINTS.MOVIES}/${movie.id}`, movie);
  return response.data;
};

export const updateMovieWithImage = async (movie: Movie, file: File): Promise<Movie> => {
  const formData = createFormData(movie, movie.user_id?.toString(), file);
  const response = await api.put<Movie>(`${API_CONFIG.ENDPOINTS.MOVIES}/${movie.id}`, formData);
  return response.data;
};

export const deleteMovie = async (movieId: number): Promise<void> => {
  await api.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/${movieId}`);
};

export const toggleFavorite = async (movieId: number, userId: string): Promise<boolean> => {
  const response = await api.post<{ isFavorite: boolean }>(`${API_CONFIG.ENDPOINTS.FAVORITES}/toggle`, {
    movieId,
    userId
  });
  return response.data.isFavorite;
};

export const checkMovieExists = async (title: string, userId?: string): Promise<boolean> => {
  if (!title.trim()) return false;

  let url = `${API_CONFIG.ENDPOINTS.MOVIES}/check-exists?title=${encodeURIComponent(title.trim())}`;
  if (userId) {
    url += `&userId=${encodeURIComponent(userId)}`;
  }

  const response = await api.get<{ exists: boolean }>(url);
  return response.data.exists;
};
