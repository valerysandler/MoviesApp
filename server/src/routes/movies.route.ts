import express from 'express';
import {
    searchMoviesController,
    getMoviesController,
    addMovieController,
    updateMovieFavoriteController,
    deleteMovieController
} from '../controllers/movies.controller';

const router = express.Router();

// Get movies from https://www.omdbapi.com/
router.get('/search', searchMoviesController);

// Get movies from database
router.get('/', getMoviesController);

// Add movie to database
router.post('/', addMovieController);

// Update movie favorite status
router.patch('/:id/favorite', updateMovieFavoriteController);

// Delete movie from database
router.delete('/:id', deleteMovieController);

export default router;
