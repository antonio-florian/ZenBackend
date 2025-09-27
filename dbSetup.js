// dbSetup.js
// Run this file to create or update your PostgreSQL database schema

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Table and columns definition
const tableName = 'ZenDB';
const columns = [
  { name: 'id', type: 'SERIAL PRIMARY KEY' },
  { name: 'name', type: 'VARCHAR(100)' },
  { name: 'email', type: 'VARCHAR(100)' },
];

async function ensureTableAndColumns() {
  // Create table if not exists
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.map(col => `${col.name} ${col.type}`).join(', ')});`;
  await pool.query(createTableSQL);

  // Get existing columns
  const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [tableName]);
  const existingCols = result.rows.map(row => row.column_name);

  // Add missing columns
  for (const col of columns) {
    if (!existingCols.includes(col.name)) {
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Added column: ${col.name}`);
    }
  }

  console.log('Database setup complete.');
  await pool.end();
}

ensureTableAndColumns().catch(err => {
  console.error('Error setting up database:', err);
  pool.end();
});
