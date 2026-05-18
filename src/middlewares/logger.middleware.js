const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
    //for now use console.log after we use liberaries like pino,wiston(structured logging  liberary) for logs
  });

  next();
};

export default loggerMiddleware;