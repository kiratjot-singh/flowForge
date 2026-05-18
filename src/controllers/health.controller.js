export const getHealthStatus = async (req, res) => {
  return res.json({
    status: "ok",
    message: "FlowForge API healthy"
  });
};

