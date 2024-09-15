const express = require('express');
const router = express.Router();
const pool = require('../config/config');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../services/imageServices');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Signup route
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { clerk_user_id, username, first_name, last_name, email } = req.body;
    const profileImage = req.file;

    let profile_image_url = '';
    if (profileImage) {
      const uploadResponse = await uploadImage(profileImage.buffer);
      profile_image_url = uploadResponse;
    }

    const result = await pool.query(
      'INSERT INTO users (clerk_user_id, username, first_name, last_name, email, profile_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [clerk_user_id, username, first_name, last_name, email, profile_image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read (get) all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post (create) a new user
router.post('/', async (req, res) => {
  const { clerk_user_id, username, first_name, last_name, email} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (clerk_user_id, username, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clerk_user_id, username, first_name, last_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Put (update) a user
router.put('/:id', upload.single('profileImage'), async (req, res) => {
  const { id } = req.params;
  const { username, first_name, last_name, email } = req.body;
  const profileImage = req.file;

  try {
    const fields = { username, first_name, last_name, email };
    let newImageUrl = null;

    // Retrieve the current profile image URL
    const userResult = await pool.query('SELECT profile_image_url FROM users WHERE user_id = $1', [id]);
    const currentImageUrl = userResult.rows[0]?.profile_image_url;

    if (profileImage) {
      const uploadResponse = await uploadImage(profileImage.buffer);
      newImageUrl = uploadResponse;
      fields.profile_image_url = newImageUrl;
    }

    // Filter out undefined fields
    const filteredFields = Object.entries(fields).filter(([key, value]) => value !== undefined);

    if (filteredFields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    const setClause = filteredFields.map(([key], index) => `${key} = $${index + 1}`).join(', ');
    const values = filteredFields.map(([, value]) => value);
    values.push(id);

    const query = `UPDATE users SET ${setClause} WHERE user_id = $${values.length} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the old profile image from Cloudinary if a new image was uploaded
    if (profileImage && currentImageUrl) {
      await deleteImage(currentImageUrl);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT profile_image_url FROM users WHERE user_id = $1', [id]);

    if (result.rows.length > 0) {
      const cloudinaryUrl = result.rows[0].profile_image_url;
      if (cloudinaryUrl) {
        await deleteImage(cloudinaryUrl);
      }

      await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    }
    //TODO: send a success message/response with the deleted user data upon successful deletion, not just '204'
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).send('Error deleting user');
  }
});

module.exports = router;