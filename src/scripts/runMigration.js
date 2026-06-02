import pool from "../config/database.js";

const res=await pool.query(`
  SELECT *
FROM deployment_logs
ORDER BY created_at DESC;

`);



console.log(res);

await pool.end();