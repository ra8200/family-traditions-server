const express = require('express');
const router = express.Router();
const pool = require('../config/config');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../services/imageServices');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET (read) all recipes
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.*, rp.cloudinary_url as photo_url 
      FROM recipes r 
      LEFT JOIN recipe_photos rp ON r.recipe_id = rp.recipe_id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    res.status(500).send('Error fetching recipes');
    next(error);
  }
});

// POST (create) a new recipe
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, ingredients, instructions, recipe_book_id, creator_id } = req.body;
  const image = req.file;

  if (!name || !description || !ingredients || !instructions || !recipe_book_id || !creator_id || !image) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const recipeResult = await client.query(
        'INSERT INTO recipes (name, description, ingredients, instructions, recipe_book_id, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, ingredients.split(','), instructions, recipe_book_id, creator_id]
      );

      const recipeId = recipeResult.rows[0].recipe_id;
      const imageUrl = await uploadImage(image.buffer);

      await client.query(
        'INSERT INTO recipe_photos (recipe_id, cloudinary_url) VALUES ($1, $2)',
        [recipeId, imageUrl]
      );

      await client.query('COMMIT');
      res.status(201).json({ ...recipeResult.rows[0], photo_url: imageUrl });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    res.status(500).json({ message: 'Failed to create recipe', details: error.message });
  }
});

// PUT (update) a recipe
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, ingredients, instructions, recipe_book_id } = req.body;
  const image = req.file;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const recipeResult = await client.query(
        'UPDATE recipes SET name = $1, description = $2, ingredients = $3, instructions = $4, recipe_book_id = $5, last_updated = CURRENT_TIMESTAMP WHERE recipe_id = $6 RETURNING *',
        [name, description, ingredients.split(','), instructions, recipe_book_id, id]
      );

      if (recipeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Recipe not found' });
      }

      let photoUrl = null;

      if (image) {
        photoUrl = await uploadImage(image.buffer);

        const existingPhoto = await client.query(
          'SELECT photo_id FROM recipe_photos WHERE recipe_id = $1',
          [id]
        );

        if (existingPhoto.rows.length > 0) {
          await client.query(
            'UPDATE recipe_photos SET cloudinary_url = $1, uploaded_at = CURRENT_TIMESTAMP WHERE recipe_id = $2',
            [photoUrl, id]
          );
        } else {
          await client.query(
            'INSERT INTO recipe_photos (recipe_id, cloudinary_url) VALUES ($1, $2)',
            [id, photoUrl]
          );
        }
      }

      await client.query('COMMIT');

      const updatedPhoto = await client.query(
        'SELECT cloudinary_url FROM recipe_photos WHERE recipe_id = $1',
        [id]
      );

      const responseData = {
        ...recipeResult.rows[0],
        photo_url: updatedPhoto.rows[0]?.cloudinary_url || null
      };

      res.json(responseData);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).send('Error updating recipe');
  }
});

// DELETE a recipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const photoResult = await client.query('SELECT cloudinary_url FROM recipe_photos WHERE recipe_id = $1', [id]);
      
      if (photoResult.rows.length > 0) {
        const cloudinaryUrl = photoResult.rows[0].cloudinary_url;
        await deleteImage(cloudinaryUrl);

        await client.query('DELETE FROM recipe_photos WHERE recipe_id = $1', [id]);
      }

      const result = await client.query('DELETE FROM recipes WHERE recipe_id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Recipe not found' });
      }

      await client.query('COMMIT');
      res.status(204).send();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    res.status(500).send('Error deleting recipe');
  }
});

module.exports = router;