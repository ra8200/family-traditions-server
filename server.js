const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

// const ClerkExpressRequireAuth = require('@clerk/clerk-sdk-express').ClerkExpressRequireAuth;

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Clerk middleware
// app.use(
//   ClerkExpressRequireAuth({
//     secretKey: process.env.CLERK_SECRET_KEY,
//   })
// );

// Import routes
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipesRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeBookRoutes = require('./routes/recipeBooksRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipeBooks', recipeBookRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Family Traditions Server API');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});