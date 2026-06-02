import crypto from "crypto";
import pool from "../config/database.js";

export const createDeploymentLog = async (
  deploymentId,
  log
) => {
  await pool.query(
    `
    INSERT INTO deployment_logs
    (
      id,
      deployment_id,
      log
    )
    VALUES
    (
      $1,
      $2,
      $3
    )
    `,
    [
      crypto.randomUUID(),
      deploymentId,
      log
    ]
  );
};

export const findDeploymentLogs = async (
  deploymentId
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM deployment_logs
    WHERE deployment_id = $1
    ORDER BY created_at ASC
    `,
    [deploymentId]
  );

  return result.rows;
};