const { validationResult } = require('express-validator');

/**
 * Factory that runs express-validator chains and returns 400 on failure.
 */
const validate = (checks) => async (req, res, next) => {
  await Promise.all(checks.map((check) => check.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

module.exports = validate;
