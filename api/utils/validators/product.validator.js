import { check, body } from "express-validator";
import validatorMiddleware from "../../middlewares/validator_middleware.js";

export const createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 character")
    .notEmpty()
    .withMessage("Product required"),

  check("description")
    .notEmpty()
    .withMessage("Product desctiption required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity required")
    .isNumeric()
    .withMessage("Product quantity must be number"),

  check("price")
    .notEmpty()
    .withMessage("Product price required")
    .isNumeric()
    .withMessage("Product price must be number")
    .isLength({ max: 32 })
    .withMessage("To long price"),

  check("image").optional().isArray().withMessage("image should be array of string"),

  //TODO: Category kismini yaptikdan sonra burayi aktif hale getir
  //   check("category")
  //     .notEmpty()
  //     .withMessage("Product must be belong to a category")
  //     .isMongoId()
  //     .withMessage("Invalid ID format")
  //     .custom((categoryID) =>
  //         categoryID.findById(categoryID).then((category) => {
  //             if(!category) {
  //                 return Promise.reject(
  //                     new Error(`No category for this id: ${categoryID}`)
  //                 )
  //             }
  //         })
  //     )
];

export const getProductValidator = [check("id").isMongoId().withMessage("Invalid ID format"), validatorMiddleware];

export const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),

  body("title").optional(),

  validatorMiddleware,
];

export const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware, //bu middleware hatalari yakalamak icin gerekli
];
