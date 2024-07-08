const { Pool } = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false 
  }
});

async function getPgVersion() {
  try {
    const result = await pool.query('SELECT version()');
    console.log(result.rows);
  } catch (error) {
    console.error('Error executing query', error.stack);
  } finally {
    pool.end();
  }
}

getPgVersion();