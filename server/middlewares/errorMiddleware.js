export const errorHandler = (err, req, res, next) => {
  console.log("Global Error Handler:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
};
