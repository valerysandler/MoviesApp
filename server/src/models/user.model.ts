export interface User {
  id: number;
  username: string;
  created_at?: Date;
}

export interface CreateUserRequest {
  username: string;
}