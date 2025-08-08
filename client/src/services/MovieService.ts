// services/MovieService.ts
export const fetchMovies = async (query: string) => {
  const res = await fetch(`http://localhost:3000/api/movies/search?title=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json(); // или .results — зависит от API
};
