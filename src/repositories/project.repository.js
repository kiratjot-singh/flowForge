import pool from "../config/database.js";

export const createProject = async ({
  id,
  name,
  repoUrl,
  branch,
  userId
}) => {
  const result = await pool.query(
    `
    INSERT INTO projects (id, name, repo_url, branch, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [id, name, repoUrl, branch, userId]
  );
  return result.rows[0];
};

export const findProjectById = async (id) => {
  const result = await pool.query(
    `
    SELECT * FROM projects
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};

export const findProjectsByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT p.*, 
           (SELECT status FROM deployments d WHERE d.project_id = p.id ORDER BY d.created_at DESC LIMIT 1) as latest_deployment_status,
           (SELECT created_at FROM deployments d WHERE d.project_id = p.id ORDER BY d.created_at DESC LIMIT 1) as latest_deployment_date
    FROM projects p
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

export const findProjectsByRepoAndBranch = async (repoUrl, branch) => {
  const result = await pool.query(
    `
    SELECT * FROM projects
    WHERE repo_url = $1 AND branch = $2
    `,
    [repoUrl, branch]
  );
  return result.rows;
};

export const deleteProject = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM projects
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return result.rows[0];
};
