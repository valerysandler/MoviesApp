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

router.get('/check-exists', checkMovieExistsController);
router.get('/search', searchMoviesController);
router.get('/', getMoviesController);
router.post('/', upload.single('poster'), addMovieController);
router.get('/:id', getMovieByIdController);
router.put('/:id', upload.single('poster'), updateMovieController);
router.patch('/:id/favorite', updateMovieFavoriteController);
router.delete('/:id', deleteMovieController);

export default router;
