export interface Movie {
  id: number;
  user_id: number;
  title: string;
  year?: string;
  runtime?: string;
  poster?: string;
  poster_local?: string; // Local path for the poster image
  genre?: string;
  director?: string;
  external_id?: string;
  is_favorite: boolean;
}
