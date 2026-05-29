import multer from 'multer';

/**
 * Handle 404 errors for route mismatches
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find route ${req.originalUrl} on this server`
  });
};

/**
 * Global centralized error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message || 'An unexpected error occurred.'
  };

  // Custom formatting for Multer upload errors
  if (err instanceof multer.MulterError) {
    res.status(400);
    response.status = 'fail';
    if (err.code === 'LIMIT_FILE_SIZE') {
      response.message = 'File is too large. Maximum limit is 10MB.';
    } else {
      response.message = `Upload error: ${err.message}`;
    }
    return res.json(response);
  }

  // Handle image validation errors
  if (err.message && err.message.includes('only JPEG, PNG, and WEBP')) {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
