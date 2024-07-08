require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/config');

// Query to get the schema of all tables
const query = `
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
ORDER BY 
    table_name, 
    ordinal_position;
`;

// Execute the query
pool.query(query, (err, res) => {
    if (err) {
        console.error(err);
        pool.end();
        return;
    }

    // Write the results to a file
    const outputPath = path.join(__dirname, 'schema_output.txt');
    fs.writeFileSync(outputPath, JSON.stringify(res.rows, null, 2));

    console.log('Schema has been written to', outputPath);

    // End the pool connection
    pool.end();
});