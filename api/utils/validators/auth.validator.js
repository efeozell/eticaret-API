import { check } from "express-validator";
import User from "../../models/user.model.js";
import slugify from "slugify";
import validatorMiddleware from "../../middlewares/validator_middleware.js";

export const signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exist"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password length must be greater 6")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }

      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("Password confirmation required"),

  validatorMiddleware,
];

export const loginValidator = [
  check("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character"),

  validatorMiddleware,
];
