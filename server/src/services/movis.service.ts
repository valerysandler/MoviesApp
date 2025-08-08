import axios from "axios";

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export async function searchMovies(title: string) {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: OMDB_API_KEY,
            s: title,
            type: 'movie', // фильтруем по фильмам
        },
    });
    if (response.data.Response === 'False') {
        throw new Error(response.data.Error);
    }
    return response.data.Search; 
}

export async function getMovieDetails(imdbID: string) {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: OMDB_API_KEY,
            i: imdbID,
        },
    });
    if (response.data.Response === 'False') {
        throw new Error(response.data.Error);
    }
    return response.data; 
}