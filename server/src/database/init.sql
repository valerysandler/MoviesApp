-- Create users table if it does not exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movies table if it does not exist
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    year VARCHAR(10),
    runtime VARCHAR(20),
    poster TEXT,
    genre VARCHAR(500),
    director VARCHAR(500),
    external_id VARCHAR(50), -- imdbID
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table for proper many-to-many relationship
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id) 
);

-- Create indexes for better performance
-- Essential indexes based on application query patterns
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON movies(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_is_favorite ON movies(is_favorite);
CREATE INDEX IF NOT EXISTS idx_favorites_user_movie ON favorites(user_id, movie_id);


-- Insert a default user for testing
INSERT INTO users (username) VALUES ('testuser') ON CONFLICT (username) DO NOTHING;

-- Add poster_local column to movies table
ALTER TABLE movies ADD COLUMN IF NOT EXISTS poster_local VARCHAR(500);