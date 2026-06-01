import pool from "../config/database.js";

await pool.query(`
  CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY,

    repo_url TEXT NOT NULL,

    branch TEXT NOT NULL,

    commit_sha TEXT NOT NULL,

    status TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
  );
`);



console.log("deployments table created");

await pool.end();