const global404Handler= (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
};
export default global404Handler;