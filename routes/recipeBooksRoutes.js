const express = require('express');
const router = express.Router();
const pool = require('../config/config');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../services/imageServices');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipe_books');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No recipe books found' });
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipe books:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, author_id } = req.body;
  const image = req.file;

  if (!name || !description || !author_id || !image) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const uploadResponse = await uploadImage(image.buffer);
    const result = await pool.query(
      'INSERT INTO recipe_books (name, description, author_id, banner_image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, author_id, uploadResponse]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating recipe book:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, author_id } = req.body;
  const image = req.file;

  if (!name || !description || !author_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let imageUrl;
    if (image) {
      imageUrl = await uploadImage(image.buffer);
    }

    const existingRecipeBook = await pool.query(
      'SELECT banner_image_url FROM recipe_books WHERE recipe_book_id = $1',
      [id]
    );

    if (existingRecipeBook.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }

    const bannerImageUrl = imageUrl || existingRecipeBook.rows[0].banner_image_url;

    const result = await pool.query(
      'UPDATE recipe_books SET name = $1, description = $2, author_id = $3, banner_image_url = $4, last_updated = CURRENT_TIMESTAMP WHERE recipe_book_id = $5 RETURNING *',
      [name, description, author_id, bannerImageUrl, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating recipe book:', error.message);
    res.status(500).send('Error updating recipe book');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT banner_image_url FROM recipe_books WHERE recipe_book_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe book not found' });
    }

    const cloudinaryUrl = result.rows[0].banner_image_url;
    await deleteImage(cloudinaryUrl);
    await pool.query('DELETE FROM recipe_books WHERE recipe_book_id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe book:', error.message);
    res.status(500).send('Error deleting recipe book');
  }
});

module.exports = router;