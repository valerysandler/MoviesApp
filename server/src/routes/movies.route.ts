import express from 'express';
import { getMoviesController } from '../controllers/movies.controller';
import { addMovieToFavoritesController } from '../controllers/movies.controller'; // Assuming this function exists

const router = express.Router();

// Get movies from https://www.omdbapi.com/
router.get('/search', getMoviesController);
router.post('/movies', addMovieToFavoritesController);


export default router;
