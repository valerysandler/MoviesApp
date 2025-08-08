export interface Movie {
  id: number;
  user_id: number;
  title: string;
  year?: string;
  runtime?: string;
  poster?: string;
  genre?: string;
  director?: string;
  external_id?: string;
  is_favorite: boolean;
}
