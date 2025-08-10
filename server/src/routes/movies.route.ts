import express from 'express';
import {
    searchMoviesController,
    getMoviesController,
    addMovieController,
    updateMovieFavoriteController,
    deleteMovieController,
    checkMovieExistsController,
    updateMovieController,
    getMovieByIdController
} from '../controllers/movies.controller';
import { upload } from '../middleware/upload';


const router = express.Router();

// Check if movie exists by title
router.get('/check-exists', checkMovieExistsController);
// Get movies from https://www.omdbapi.com/
router.get('/search', searchMoviesController);
// Get movies from database
router.get('/', getMoviesController);
// Add movie to database
router.post('/', upload.single('poster'), addMovieController);
// Get movie by ID (должен быть перед /:id маршрутами с параметрами)
router.get('/:id', getMovieByIdController);
// Update movie in database
router.put('/:id', upload.single('poster'), updateMovieController);
// Update movie favorite status
router.patch('/:id/favorite', updateMovieFavoriteController);
// Delete movie from database
router.delete('/:id', deleteMovieController);


export default router;
