require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/config'); // Make sure this path is correct

const query = `
SELECT 
    table_schema,
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM 
    information_schema.columns 
WHERE 
    table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 
    table_schema,
    table_name, 
    ordinal_position;
`;

console.log('Connecting to database...');

pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }

  console.log('Successfully connected to the database. Executing query...');

  client.query(query, (err, res) => {
    done(); // Release the client back to the pool

    if (err) {
      console.error('Error executing schema query:', err);
      return;
    }

    console.log(`Query returned ${res.rows.length} rows.`);

    if (res.rows.length === 0) {
      console.log('No tables found in any schema');
      const outputPath = path.join(__dirname, 'schema_output.md');
      fs.writeFileSync(outputPath, '# Database Schema\n\nNo tables found in the database.');
      console.log('Empty schema information has been written to', outputPath);
      return;
    }

    const schema = res.rows.reduce((acc, row) => {
      if (!acc[row.table_schema]) {
        acc[row.table_schema] = {};
      }
      if (!acc[row.table_schema][row.table_name]) {
        acc[row.table_schema][row.table_name] = [];
      }
      acc[row.table_schema][row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable,
        default: row.column_default
      });
      return acc;
    }, {});

    const outputPath = path.join(__dirname, 'schema_output.md');
    let output = '# Database Schema\n\n';
    
    for (const [schemaName, tables] of Object.entries(schema)) {
      output += `# Schema: ${schemaName}\n\n`;
      for (const [tableName, columns] of Object.entries(tables)) {
        output += `## Table: ${tableName}\n\n`;
        output += '| Column | Type | Nullable | Default |\n';
        output += '|--------|------|----------|--------|\n';
        columns.forEach(col => {
          output += `| ${col.column} | ${col.type} | ${col.nullable} | ${col.default || 'N/A'} |\n`;
        });
        output += '\n';
      }
    }

    fs.writeFileSync(outputPath, output);
    console.log('Schema has been written to', outputPath);
  });
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
