const Joi = require("joi");

const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(15).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Bad Request", error: error.details });
  }
  next();
};

const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(4).max(15).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Bad Request", error: error.details });
  }
  next();
};

module.exports = { signupValidation, loginValidation };
