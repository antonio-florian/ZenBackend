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
  // Check if table exists (PostgreSQL stores unquoted table names in lowercase)
  const tableExistsResult = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    ) AS exists`,
    [tableName.toLowerCase()]
  );
  const tableExists = tableExistsResult.rows[0].exists;

  if (!tableExists) {
    // Create table with all columns if it doesn't exist
    const createTableSQL = `CREATE TABLE ${tableName} (${columns.map(col => `${col.name} ${col.type}`).join(', ')});`;
    await pool.query(createTableSQL);
    console.log(`Table '${tableName}' created.`);
  } else {
    // Table exists, check for missing columns
    const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`, [tableName.toLowerCase()]);
    const existingCols = result.rows.map(row => row.column_name);
    for (const col of columns) {
      if (!existingCols.includes(col.name)) {
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type};`);
        console.log(`Added column: ${col.name}`);
      }
    }
    console.log(`Table '${tableName}' already exists. Columns updated if needed.`);
  }
  await pool.end();
}

ensureTableAndColumns().catch(err => {
  console.error('Error setting up database:', err);
  pool.end();
});
