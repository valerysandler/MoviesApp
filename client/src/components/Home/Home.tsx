import styles from './Home.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useState } from 'react';
import { fetchMovies } from '../../services/MovieService';
import type { Movie } from '../../models/MovieModel';
import MovieList from '../MovieList/MovieList';

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const data = await fetchMovies(query);
      console.log(data)
      setMovies(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Movies</h1>

      <SearchBar onSearch={handleSearch} />

      <MovieList movies={movies} />

    </div>
  );
};

export default Home;
