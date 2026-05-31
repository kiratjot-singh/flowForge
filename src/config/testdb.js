// import pool from "./database.js";
// import env from "./env.js";


// await pool.query(`
//   CREATE TABLE IF NOT EXISTS users (
//     id UUID PRIMARY KEY,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW()
//   );
// `);

// console.log("table created");
// await pool.end();

// import crypto from "crypto";
// import pool from "./database.js";

// const id = crypto.randomUUID();

// const result = await pool.query(
//   `
//   INSERT INTO users (id, email, password)
//   VALUES ($1, $2, $3)
//   RETURNING *;
//   `,
//   [
//     id,
//     "test@example.com",
//     "secret123"
//   ]
// );

// console.log(result.rows);

// await pool.end();

import pool from "./database.js";

const result = await pool.query(
  "SELECT * FROM users"
);

console.log(result.rows);

await pool.end();