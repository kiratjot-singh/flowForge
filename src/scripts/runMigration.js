import pool from "../config/database.js";

const res=await pool.query(`
  SELECT
id,
status,
output_directory
FROM deployments
WHERE id='0b700d13-d99c-4c05-9e2e-380367029ed9';

`);



console.log(res.rows);

await pool.end();