import express from 'express';
import { getMoviesController } from '../controllers/movies.controller';

const router = express.Router();

// Get movies from https://www.omdbapi.com/
// Option 1: Query parameter: /api/movies/search?title=moviename
router.get('/search', getMoviesController);

// Option 2: Path parameter: /api/movies/search/batman
// router.get('/search/:title', getMoviesController);

export default router;
