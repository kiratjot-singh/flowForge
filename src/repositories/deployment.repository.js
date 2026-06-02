import pool from "../config/database.js";

export const createDeployment = async ({
  id,
  repoUrl,
  branch,
  commitSha,
  status
}) => {
  const result = await pool.query(
    `
    INSERT INTO deployments
    (
      id,
      repo_url,
      branch,
      commit_sha,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING *
    `,
    [
      id,
      repoUrl,
      branch,
      commitSha,
      status
    ]
  );

  return result.rows[0];
};

export const findDeploymentById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM deployments
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export const updateDeploymentStatus = async (
  id,
  status
) => {
  const result = await pool.query(
    `
    UPDATE deployments
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  return result.rows[0];
};