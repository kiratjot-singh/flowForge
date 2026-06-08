import pool from "../config/database.js";

export const createDeployment = async ({
  id,
  projectId,
  commitSha,
  status
}) => {
  const result = await pool.query(
    `
    INSERT INTO deployments
    (
      id,
      project_id,
      commit_sha,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING *
    `,
    [
      id,
      projectId,
      commitSha,
      status
    ]
  );

  return result.rows[0];
};

export const findDeploymentById = async (id) => {
  const result = await pool.query(
    `
    SELECT d.*, p.repo_url, p.branch, p.name as project_name, p.user_id
    FROM deployments d
    JOIN projects p ON d.project_id = p.id
    WHERE d.id = $1
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

export const updateDeploymentOutputDirectory =
  async (deploymentId, outputDirectory) => {
    await pool.query(
      `
      UPDATE deployments
      SET output_directory = $1
      WHERE id = $2
      `,
      [outputDirectory, deploymentId]
    );
  };

export const findDeploymentsByProjectId = async (projectId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM deployments
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId]
  );

  return result.rows;
};

export const findAllDeployments = async (userId) => {
  const result = await pool.query(
    `
    SELECT d.*, p.repo_url, p.branch, p.name as project_name
    FROM deployments d
    JOIN projects p ON d.project_id = p.id
    WHERE p.user_id = $1
    ORDER BY d.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};
