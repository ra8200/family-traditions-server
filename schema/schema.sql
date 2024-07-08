-- Permissions Matrix Table
CREATE TABLE IF NOT EXISTS permissions_matrix (
    matrix_id serial PRIMARY KEY,
    role_id INT NOT NULL,
    permission_name VARCHAR(255) NOT NULL
);

-- Recipe Books Table
CREATE TABLE IF NOT EXISTS recipe_books (
    recipe_book_id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    banner_image_url VARCHAR(255),
    author_id INT NOT NULL,
    creation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recipes INTEGER[] -- Assuming it's an array of integers referencing recipe IDs
);

-- Recipe Photos Table
CREATE TABLE IF NOT EXISTS recipe_photos (
    photo_id serial PRIMARY KEY,
    recipe_id INT NOT NULL,
    cloudinary_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
    recipe_id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    ingredients VARCHAR[] NOT NULL,
    instructions TEXT NOT NULL,
    recipe_book_id INT NOT NULL,
    creator_id INT NOT NULL,
    creation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (recipe_book_id) REFERENCES recipe_books (recipe_book_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users (user_id)
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id serial PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

-- User Account Permissions Table
CREATE TABLE IF NOT EXISTS user_account_permissions (
    account_permission_id serial PRIMARY KEY,
    user_id INT NOT NULL,
    permission_name VARCHAR(255) NOT NULL
);

-- User Has Permission Table
CREATE TABLE IF NOT EXISTS user_has_permission (
    permission_id serial PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_book_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (recipe_book_id) REFERENCES recipe_books(recipe_book_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id serial PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$'),
    profile_image_url VARCHAR(255),
    creation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMPTZ
);
