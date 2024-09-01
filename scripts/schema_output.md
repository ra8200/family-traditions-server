# Database Schema

# Schema: public

## Table: permissions_matrix

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| matrix_id | integer | NO | nextval('permissions_matrix_matrix_id_seq'::regclass) |
| role_id | integer | NO | N/A |
| permission_name | character varying | NO | N/A |

## Table: recipe_books

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| recipe_book_id | integer | NO | nextval('recipe_books_recipe_book_id_seq'::regclass) |
| name | character varying | NO | N/A |
| description | character varying | YES | N/A |
| banner_image_url | character varying | YES | N/A |
| author_id | integer | NO | N/A |
| creation_date | timestamp with time zone | NO | CURRENT_TIMESTAMP |
| last_updated | timestamp with time zone | NO | CURRENT_TIMESTAMP |
| recipes | ARRAY | YES | N/A |

## Table: recipe_photos

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| photo_id | integer | NO | nextval('recipe_photos_photo_id_seq'::regclass) |
| cloudinary_url | character varying | NO | N/A |
| uploaded_at | timestamp with time zone | NO | CURRENT_TIMESTAMP |
| recipe_id | integer | YES | N/A |

## Table: recipes

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| recipe_id | integer | NO | N/A |
| name | character varying | NO | N/A |
| description | character varying | YES | N/A |
| ingredients | ARRAY | NO | N/A |
| instructions | text | NO | N/A |
| recipe_book_id | integer | NO | N/A |
| creator_id | integer | NO | N/A |
| creation_date | timestamp with time zone | NO | CURRENT_TIMESTAMP |
| last_updated | timestamp with time zone | NO | CURRENT_TIMESTAMP |

## Table: roles

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| role_id | integer | NO | nextval('roles_role_id_seq'::regclass) |
| role_name | character varying | NO | N/A |

## Table: user_account_permissions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| account_permission_id | integer | NO | nextval('user_account_permissions_account_permission_id_seq'::regclass) |
| user_id | integer | NO | N/A |
| permission_name | character varying | NO | N/A |

## Table: user_has_permission

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| permission_id | integer | NO | nextval('user_has_permission_permission_id_seq'::regclass) |
| user_id | integer | NO | N/A |
| recipe_book_id | integer | NO | N/A |
| role_id | integer | NO | N/A |

## Table: users

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| user_id | integer | NO | nextval('users_user_id_seq'::regclass) |
| clerk_user_id | character varying | NO | N/A |
| username | character varying | NO | N/A |
| first_name | character varying | NO | N/A |
| last_name | character varying | NO | N/A |
| email | character varying | NO | N/A |
| profile_image_url | character varying | YES | N/A |
| creation_date | timestamp with time zone | NO | CURRENT_TIMESTAMP |
| last_login | timestamp with time zone | YES | N/A |

