const requiredEnvVars = [
  'DATABASE_URL',
  'PGHOST',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD',
  'ENDPOINT_ID',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_URL',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

function validateEnv() {
  console.log('Validating environment variables...');
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  console.log('Environment variables validated successfully.');
}

module.exports = validateEnv;