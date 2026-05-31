//we can call this function where we
// want to validate request with the specific schema from validators folder

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const flattened = result.error.flatten();

    const formattedErrors = {};

    // Handle field errors
    for (const [key, value] of Object.entries(flattened.fieldErrors)) {
      if (value && value.length > 0) {
        formattedErrors[key] = value[0];
      }
    }

    // Handle form errors (important fix)
    if (flattened.formErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: flattened.formErrors[0],
        errors: formattedErrors
      });
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors
    });
  }

  req.body = result.data;
  next();
};

export default validate;