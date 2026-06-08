import pool from "../config/database.js";

export const initDb = async () => {
  try {
    // Drop old tables if the database has old deployments schema (has repo_url column)
    await pool.query(`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'deployments' AND column_name = 'repo_url'
          ) THEN
              DROP TABLE IF EXISTS deployment_logs CASCADE;
              DROP TABLE IF EXISTS deployments CASCADE;
          END IF;
      END $$;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        repo_url TEXT NOT NULL,
        branch VARCHAR(255) NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create deployments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deployments (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        commit_sha TEXT NOT NULL,
        status TEXT NOT NULL,
        output_directory TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create deployment_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deployment_logs (
        id UUID PRIMARY KEY,
        deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
        log TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};
