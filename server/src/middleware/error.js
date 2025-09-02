// 404
export function notFound(req, res, next) {
    res.status(404).json({ error: "Not found" });
  }
  
  // Central error handler – avoids unhandled rejections leaking
  export function errorHandler(err, req, res, next) {
    console.error(err);
    if (res.headersSent) return;
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
  }
  
  // Small helper to wrap async route handlers
  export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  